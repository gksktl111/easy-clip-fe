"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { requestAccessRefresh } from "@/shared/access/accessEvents";
import { ApiError } from "@/shared/lib/apiClient";

import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/features/auth";

const createAuthRequiredError = () => new Error("AUTH_REQUIRED");

// 폴더 생성, 이름 변경, 삭제와 optimistic 순서 변경 액션을 관리합니다.
export const useFolderActions = () => {
  const { user } = useAuth();
  const access = useResourceAccess();
  const isAuthenticated = Boolean(user);
  const queryClient = useQueryClient();
  const folderQueryKey = useMemo(
    () => getFolderQueryKey(user?.id ?? null),
    [user?.id],
  );
  const setFolders = useCallback(
    (updater: (currentFolders: FolderItem[]) => FolderItem[]) => {
      queryClient.setQueryData<FolderItem[]>(folderQueryKey, (currentFolders) =>
        updater(currentFolders ?? []),
      );
    },
    [folderQueryKey, queryClient],
  );

  const { mutateAsync: createFolder, isPending: isCreatingFolder } =
    useMutation({
      mutationFn: async (name: string) => {
        if (!isAuthenticated) {
          throw createAuthRequiredError();
        }

        if (!access.canCreateFolder)
          throw new ApiError(
            "폴더 생성 권한을 확인해주세요.",
            409,
            "PLAN_LIMIT_EXCEEDED",
          );
        return createFolderRequest({ name });
      },
      onSuccess: (createdFolder) => {
        requestAccessRefresh();
        setFolders((folders) =>
          sortFolders([...folders, mapFolder(createdFolder)]),
        );
      },
    });

  const { mutateAsync: renameFolderMutation, isPending: isRenamingFolder } =
    useMutation({
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

        if (access.status !== "ready" || access.folderLocks[folderId] !== false)
          throw new ApiError("잠긴 폴더입니다.", 403, "PROJECT_LOCKED");
        return updateFolderRequest(folderId, { name });
      },
      onSuccess: (updatedFolder) => {
        requestAccessRefresh();
        setFolders((folders) =>
          sortFolders(
            folders.map((folder) =>
              folder.id === updatedFolder.id
                ? { ...folder, ...mapFolder(updatedFolder) }
                : folder,
            ),
          ),
        );
      },
    });

  const { mutateAsync: removeFolder, isPending: isRemovingFolder } =
    useMutation({
      mutationFn: async (folderId: string) => {
        if (!isAuthenticated) {
          throw createAuthRequiredError();
        }

        await deleteFolderRequest(folderId);
        return folderId;
      },
      onSuccess: (folderId) => {
        requestAccessRefresh();
        setFolders((folders) =>
          folders.filter((folder) => folder.id !== folderId),
        );
      },
    });

  const { mutateAsync: reorderFolder, isPending: isReorderingFolder } =
    useMutation({
      mutationFn: async (
        payload: Parameters<typeof reorderFolderRequest>[0],
      ) => {
        if (!isAuthenticated) {
          throw createAuthRequiredError();
        }

        if (!access.isPro || access.status !== "ready")
          throw new ApiError(
            "Pro에서 폴더 순서를 변경할 수 있습니다.",
            403,
            "FEATURE_NOT_AVAILABLE",
          );
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
        return false;
      }

      const payload =
        position === "after"
          ? { targetId: sourceId, afterId: targetId }
          : { targetId: sourceId, beforeId: targetId };

      try {
        await queryClient.cancelQueries({ queryKey: folderQueryKey });
        queryClient.setQueryData(folderQueryKey, nextFolders);
        await reorderFolder(payload);
        return true;
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
    isCreatingFolder,
    isRemovingFolder,
    isRenamingFolder,
    isReorderingFolder,
    removeFolder,
    renameFolder,
    saveFolderOrder,
  };
};
