"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  createFolder as createFolderRequest,
  deleteFolder as deleteFolderRequest,
  reorderFolder as reorderFolderRequest,
  updateFolder as updateFolderRequest,
} from "@/features/folder/api/folderApi";
import type {
  FolderDropPosition,
  FolderItem,
} from "@/features/folder/model/folder";
import {
  mapFolder,
  reorderFolderItems,
  sortFolders,
} from "@/features/folder/service/folderCollection";
import { getFolderQueryKey } from "@/features/folder/service/folderQueryCache";
import { invalidateTrashQueries } from "@/features/trash/service/trashQueryCache";

const createAuthRequiredError = () => new Error("AUTH_REQUIRED");

// 폴더 생성, 이름 변경, 삭제와 optimistic 순서 변경 액션을 관리합니다.
export const useFolderActions = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const queryClient = useQueryClient();
  const folderQueryKey = useMemo(
    () => getFolderQueryKey(session?.user?.id ?? null),
    [session?.user?.id],
  );
  const setFolders = useCallback(
    (updater: (currentFolders: FolderItem[]) => FolderItem[]) => {
      queryClient.setQueryData<FolderItem[]>(folderQueryKey, (currentFolders) =>
        updater(currentFolders ?? []),
      );
    },
    [folderQueryKey, queryClient],
  );

  const { mutateAsync: createFolder } = useMutation({
    mutationFn: async (name: string) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      return createFolderRequest({ name });
    },
    onSuccess: (createdFolder) => {
      setFolders((folders) =>
        sortFolders([...folders, mapFolder(createdFolder)]),
      );
    },
  });

  const { mutateAsync: renameFolderMutation } = useMutation({
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
      setFolders((folders) =>
        sortFolders(
          folders.map((folder) =>
            folder.id === updatedFolder.id ? mapFolder(updatedFolder) : folder,
          ),
        ),
      );
    },
  });

  const { mutateAsync: removeFolder } = useMutation({
    mutationFn: async (folderId: string) => {
      if (!isAuthenticated) {
        throw createAuthRequiredError();
      }

      await deleteFolderRequest(folderId);
      return folderId;
    },
    onSuccess: (folderId) => {
      setFolders((folders) =>
        folders.filter((folder) => folder.id !== folderId),
      );
      void invalidateTrashQueries(queryClient);
    },
  });

  const { mutateAsync: reorderFolder } = useMutation({
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

  const renameFolder = useCallback(
    (folderId: string, name: string) =>
      renameFolderMutation({ folderId, name }),
    [renameFolderMutation],
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

      const currentFolders =
        queryClient.getQueryData<FolderItem[]>(folderQueryKey) ?? [];
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
        await reorderFolder(payload);
      } catch (error) {
        queryClient.setQueryData(folderQueryKey, currentFolders);
        void queryClient.invalidateQueries({ queryKey: folderQueryKey });
        throw error;
      }
    },
    [folderQueryKey, isAuthenticated, queryClient, reorderFolder],
  );

  return {
    createFolder,
    removeFolder,
    renameFolder,
    saveFolderOrder,
  };
};
