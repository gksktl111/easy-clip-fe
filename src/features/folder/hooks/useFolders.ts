"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  createFolder as createFolderRequest,
  deleteFolder as deleteFolderRequest,
  fetchFolders,
  reorderFolder as reorderFolderRequest,
  updateFolder as updateFolderRequest,
} from "@/features/folder/api/folderApi";
import { FolderItem } from "@/features/folder/model/folder";
import {
  FolderResponseDto,
} from "@/features/folder/model/folder.dto";

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
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFolders = useCallback(async () => {
    if (!accessToken) {
      setFolders([]);
      return [];
    }

    setIsLoading(true);

    try {
      const response = await fetchFolders(accessToken);
      const nextFolders = sortFolders(response.map(mapFolder));
      setFolders(nextFolders);
      return nextFolders;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refreshFolders();
  }, [refreshFolders]);

  const createFolder = useCallback(
    async (name: string) => {
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      const createdFolder = await createFolderRequest(accessToken, { name });
      setFolders((currentFolders) =>
        sortFolders([...currentFolders, mapFolder(createdFolder)]),
      );
    },
    [accessToken],
  );

  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      const updatedFolder = await updateFolderRequest(accessToken, folderId, {
        name,
      });
      setFolders((currentFolders) =>
        sortFolders(
          currentFolders.map((folder) =>
            folder.id === folderId ? mapFolder(updatedFolder) : folder,
          ),
        ),
      );
    },
    [accessToken],
  );

  const removeFolder = useCallback(
    async (folderId: string) => {
      if (!accessToken) {
        throw createAuthRequiredError();
      }

      await deleteFolderRequest(accessToken, folderId);
      setFolders((currentFolders) =>
        currentFolders.filter((folder) => folder.id !== folderId),
      );
    },
    [accessToken],
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

      await reorderFolderRequest(accessToken, payload);
      await refreshFolders();
    },
    [accessToken, folders, refreshFolders],
  );

  return {
    folders,
    isLoading,
    createFolder,
    renameFolder,
    removeFolder,
    reorderFolders,
  };
};
