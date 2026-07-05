"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useCallback,
  useMemo,
} from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  createFolder as createFolderRequest,
  deleteFolder as deleteFolderRequest,
  fetchFolders,
  reorderFolder as reorderFolderRequest,
  updateFolder as updateFolderRequest,
} from "@/features/folder/api/folderApi";
import type {
  FolderDropPosition,
  FolderItem,
} from "@/features/folder/model/folder";
import { FolderResponseDto } from "@/features/folder/model/folder.dto";
import { invalidateTrashQueries } from "@/features/trash/service/trashQueryCache";
import { waitForMinimumLoading } from "@/shared/lib/loading";

export const FOLDER_QUERY_KEY = "folders";
const FOLDER_QUERY_KEYS = {
  all: [FOLDER_QUERY_KEY] as const,
};

const sortFolders = (folders: FolderItem[]) =>
  [...folders].sort((left, right) => left.order - right.order);

const reorderFolderItems = (
  folders: FolderItem[],
  sourceId: string,
  targetId: string,
  position: FolderDropPosition,
) => {
  if (sourceId === targetId) {
    return folders;
  }

  const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
  const targetIndex = folders.findIndex((folder) => folder.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return folders;
  }

  const nextFolders = [...folders];
  const [sourceFolder] = nextFolders.splice(sourceIndex, 1);

  if (!sourceFolder) {
    return folders;
  }

  const adjustedTargetIndex = nextFolders.findIndex(
    (folder) => folder.id === targetId,
  );

  if (adjustedTargetIndex === -1) {
    return folders;
  }

  nextFolders.splice(
    position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex,
    0,
    sourceFolder,
  );

  const isSameOrder = nextFolders.every(
    (folder, index) => folder.id === folders[index]?.id,
  );

  if (isSameOrder) {
    return folders;
  }

  return nextFolders.map((folder, index) => ({
    ...folder,
    order: index,
  }));
};

const mapFolder = (folder: FolderResponseDto): FolderItem => ({
  id: folder.id,
  name: folder.name,
  order: folder.order,
});

const createAuthRequiredError = () => new Error("AUTH_REQUIRED");

export const useFolders = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();
  const folderQueryKey = useMemo(
    () => [...FOLDER_QUERY_KEYS.all, userId] as const,
    [userId],
  );

  const folderQuery = useQuery({
    queryKey: folderQueryKey,
    enabled: isAuthenticated,
    queryFn: async () => {
      const loadingStartedAt = Date.now();

      if (!isAuthenticated) {
        return [];
      }

      try {
        const response = await fetchFolders();
        return sortFolders(response.map(mapFolder));
      } finally {
        await waitForMinimumLoading(loadingStartedAt);
      }
    },
  });

  const folders = useMemo(
    () => (isAuthenticated ? (folderQuery.data ?? []) : []),
    [isAuthenticated, folderQuery.data],
  );
  const setFolders = useCallback(
    (updater: (currentFolders: FolderItem[]) => FolderItem[]) => {
      queryClient.setQueryData<FolderItem[]>(
        folderQueryKey,
        (currentFolders) => updater(currentFolders ?? []),
      );
    },
    [folderQueryKey, queryClient],
  );

  const { mutateAsync: createFolderAsync } = useMutation({
    mutationFn: async (name: string) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      return createFolderRequest({ name });
    },
    onSuccess: (createdFolder) => {
      setFolders((currentFolders) =>
        sortFolders([...currentFolders, mapFolder(createdFolder)]),
      );
    },
  });

  const { mutateAsync: renameFolderAsync } = useMutation({
    mutationFn: async ({
      folderId,
      name,
    }: {
      folderId: string;
      name: string;
    }) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      return updateFolderRequest(folderId, { name });
    },
    onSuccess: (updatedFolder) => {
      setFolders((currentFolders) =>
        sortFolders(
          currentFolders.map((folder) =>
            folder.id === updatedFolder.id ? mapFolder(updatedFolder) : folder,
          ),
        ),
      );
    },
  });

  const { mutateAsync: removeFolderAsync } = useMutation({
    mutationFn: async (folderId: string) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      await deleteFolderRequest(folderId);
      return folderId;
    },
    onSuccess: (folderId) => {
      setFolders((currentFolders) =>
        currentFolders.filter((folder) => folder.id !== folderId),
      );
      void invalidateTrashQueries(queryClient);
    },
  });

  const { mutateAsync: reorderFolderAsync } = useMutation({
    mutationFn: async (payload: Parameters<typeof reorderFolderRequest>[0]) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      return reorderFolderRequest(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderQueryKey });
    },
  });

  const createFolder = useCallback(
    async (name: string) => {
      await createFolderAsync(name);
    },
    [createFolderAsync],
  );

  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      await renameFolderAsync({ folderId, name });
    },
    [renameFolderAsync],
  );

  const removeFolder = useCallback(
    async (folderId: string) => {
      await removeFolderAsync(folderId);
    },
    [removeFolderAsync],
  );

  const saveFolderOrder = useCallback(
    async (
      sourceId: string,
      targetId: string,
      position: FolderDropPosition,
    ) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      if (sourceId === targetId) {
        return;
      }

      const currentFolders =
        queryClient.getQueryData<FolderItem[]>(folderQueryKey) ?? folders;
      const nextFolders = reorderFolderItems(
        currentFolders,
        sourceId,
        targetId,
        position,
      );

      if (nextFolders === currentFolders) {
        return;
      }

      const payload =
        position === "after"
          ? { targetId: sourceId, afterId: targetId }
          : { targetId: sourceId, beforeId: targetId };

      try {
        await queryClient.cancelQueries({ queryKey: folderQueryKey });
        queryClient.setQueryData(folderQueryKey, nextFolders);
        await reorderFolderAsync(payload);
      } catch (error) {
        queryClient.setQueryData(folderQueryKey, currentFolders);
        void queryClient.invalidateQueries({ queryKey: folderQueryKey });
        throw error;
      }
    },
    [
      folderQueryKey,
      folders,
      isAuthenticated,
      queryClient,
      reorderFolderAsync,
    ],
  );

  return {
    folders,
    isLoading: isAuthenticated && folderQuery.isPending,
    createFolder,
    renameFolder,
    removeFolder,
    saveFolderOrder,
  };
};
