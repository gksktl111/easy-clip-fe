"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { fetchFolders } from "@/features/folder/api/folderApi";
import { FolderResponseDto } from "@/features/folder/model/folder.dto";
import {
  deleteTrashClip,
  deleteTrashFolder,
  fetchTrashClips,
  fetchTrashFolders,
  restoreTrashClip,
  restoreTrashFolder,
} from "@/features/trash/api/trashApi";
import {
  TrashClipResponseDto,
  TrashFolderResponseDto,
} from "@/features/trash/model/trash.dto";

export const useTrashPage = () => {
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const [clips, setClips] = useState<TrashClipResponseDto[]>([]);
  const [folders, setFolders] = useState<TrashFolderResponseDto[]>([]);
  const [activeFolders, setActiveFolders] = useState<FolderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  const loadTrash = useCallback(async () => {
    if (!accessToken) {
      startTransition(() => {
        setClips([]);
        setFolders([]);
        setActiveFolders([]);
        setIsLoading(false);
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [trashClips, trashFolders, currentFolders] = await Promise.all([
        fetchTrashClips(accessToken),
        fetchTrashFolders(accessToken),
        fetchFolders(accessToken),
      ]);

      startTransition(() => {
        setClips(trashClips.items);
        setFolders(trashFolders.items);
        setActiveFolders(currentFolders);
      });
    } catch {
      setError("load");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadTrash();
  }, [loadTrash]);

  const runAction = useCallback(
    async (actionKey: string, action: () => Promise<unknown>) => {
      setPendingActionKey(actionKey);
      setError(null);

      try {
        await action();
        await loadTrash();
      } catch {
        setError("action");
      } finally {
        setPendingActionKey(null);
      }
    },
    [loadTrash],
  );

  const handleRestoreClip = useCallback(
    async (clipId: string) => {
      if (!accessToken) {
        return;
      }

      await runAction(`clip-restore-${clipId}`, () =>
        restoreTrashClip(accessToken, clipId),
      );
    },
    [accessToken, runAction],
  );

  const handleDeleteClip = useCallback(
    async (clipId: string) => {
      if (!accessToken) {
        return;
      }

      await runAction(`clip-delete-${clipId}`, () =>
        deleteTrashClip(accessToken, clipId),
      );
    },
    [accessToken, runAction],
  );

  const handleRestoreFolder = useCallback(
    async (folderId: string) => {
      if (!accessToken) {
        return;
      }

      await runAction(`folder-restore-${folderId}`, () =>
        restoreTrashFolder(accessToken, folderId),
      );
    },
    [accessToken, runAction],
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      if (!accessToken) {
        return;
      }

      await runAction(`folder-delete-${folderId}`, () =>
        deleteTrashFolder(accessToken, folderId),
      );
    },
    [accessToken, runAction],
  );

  const handleClearAll = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    await runAction("trash-clear-all", async () => {
      for (const clip of clips) {
        await deleteTrashClip(accessToken, clip.id);
      }

      for (const folder of folders) {
        await deleteTrashFolder(accessToken, folder.id);
      }
    });
  }, [accessToken, clips, folders, runAction]);

  return {
    clips,
    folders,
    activeFolders,
    isLoading,
    error,
    hasItems: clips.length > 0 || folders.length > 0,
    pendingActionKey,
    reload: loadTrash,
    handleRestoreClip,
    handleDeleteClip,
    handleRestoreFolder,
    handleDeleteFolder,
    handleClearAll,
  };
};
