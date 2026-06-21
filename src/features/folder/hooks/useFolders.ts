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
import { FolderItem } from "@/features/folder/model/folder";
import { FolderResponseDto } from "@/features/folder/model/folder.dto";
import { waitForMinimumLoading } from "@/shared/lib/loading";

export const FOLDER_QUERY_KEY = "folders";
const FOLDER_QUERY_KEYS = {
  all: [FOLDER_QUERY_KEY] as const,
};

const sortFolders = (folders: FolderItem[]) =>
  [...folders].sort((left, right) => left.order - right.order);

const mapFolder = (folder: FolderResponseDto): FolderItem => ({
  id: folder.id,
  name: folder.name,
  order: folder.order,
});

const createAuthRequiredError = () => new Error("AUTH_REQUIRED");

export const useFolders = () => {
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();
  const folderQueryKey = useMemo(
    () => [...FOLDER_QUERY_KEYS.all, userId] as const,
    [userId],
  );

  const folderQuery = useQuery({
    queryKey: folderQueryKey,
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const loadingStartedAt = Date.now();

      if (!accessToken) {
        return [];
      }

      try {
        const response = await fetchFolders(accessToken);
        return sortFolders(response.map(mapFolder));
      } finally {
        await waitForMinimumLoading(loadingStartedAt);
      }
    },
  });

  const folders = useMemo(
    () => (accessToken ? (folderQuery.data ?? []) : []),
    [accessToken, folderQuery.data],
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
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      return createFolderRequest(accessToken, { name });
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
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      return updateFolderRequest(accessToken, folderId, { name });
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
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      await deleteFolderRequest(accessToken, folderId);
      return folderId;
    },
    onSuccess: (folderId) => {
      setFolders((currentFolders) =>
        currentFolders.filter((folder) => folder.id !== folderId),
      );
    },
  });

  const { mutateAsync: reorderFolderAsync } = useMutation({
    mutationFn: async (payload: Parameters<typeof reorderFolderRequest>[1]) => {
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      return reorderFolderRequest(accessToken, payload);
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

  const reorderFolders = useCallback(
    async (sourceId: string, targetId: string) => {
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      if (sourceId === targetId) {
        return;
      }

      const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
      const targetIndex = folders.findIndex((folder) => folder.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return;
      }

      const payload =
        sourceIndex < targetIndex
          ? { targetId: sourceId, afterId: targetId }
          : { targetId: sourceId, beforeId: targetId };

      await reorderFolderAsync(payload);
    },
    [accessToken, folders, reorderFolderAsync],
  );

  return {
    folders,
    isLoading: Boolean(accessToken) && folderQuery.isPending,
    createFolder,
    renameFolder,
    removeFolder,
    reorderFolders,
  };
};
