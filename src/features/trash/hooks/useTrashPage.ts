"use client";

import { useCallback, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { useFolders } from "@/features/folder/hooks/useFolders";
import {
  deleteAllTrashItems,
  deleteTrashClip,
  deleteTrashFolder,
  fetchTrashItems,
  restoreTrashClip,
  restoreTrashFolder,
} from "@/features/trash/api/trashApi";
import { waitForMinimumLoading } from "@/shared/lib/loading";

const TRASH_QUERY_KEYS = {
  all: ["trash"] as const,
  items: (userId: string | null) =>
    [...TRASH_QUERY_KEYS.all, "items", userId] as const,
};

export const useTrashPage = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();
  const { folders: activeFolders } = useFolders();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  const trashItemsQuery = useInfiniteQuery({
    queryKey: TRASH_QUERY_KEYS.items(userId),
    enabled: isAuthenticated,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const loadingStartedAt = Date.now();

      try {
        return await fetchTrashItems({ cursor: pageParam });
      } finally {
        await waitForMinimumLoading(loadingStartedAt);
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    placeholderData: (previousData) => previousData,
  });

  const reload = useCallback(async () => {
    setActionError(null);
    await trashItemsQuery.refetch();
  }, [trashItemsQuery]);

  const refreshTrash = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: TRASH_QUERY_KEYS.all });
  }, [queryClient]);

  const runAction = useCallback(
    async (actionKey: string, action: () => Promise<unknown>) => {
      setPendingActionKey(actionKey);
      setActionError(null);

      try {
        await action();
        await refreshTrash();
      } catch {
        setActionError("action");
      } finally {
        setPendingActionKey(null);
      }
    },
    [refreshTrash],
  );

  const handleRestoreClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated) {
        return;
      }

      await runAction(`clip-restore-${clipId}`, () => restoreTrashClip(clipId));
    },
    [isAuthenticated, runAction],
  );

  const handleDeleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated) {
        return;
      }

      await runAction(`clip-delete-${clipId}`, () => deleteTrashClip(clipId));
    },
    [isAuthenticated, runAction],
  );

  const handleRestoreFolder = useCallback(
    async (folderId: string) => {
      if (!isAuthenticated) {
        return;
      }

      await runAction(`folder-restore-${folderId}`, () =>
        restoreTrashFolder(folderId),
      );
    },
    [isAuthenticated, runAction],
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      if (!isAuthenticated) {
        return;
      }

      await runAction(`folder-delete-${folderId}`, () =>
        deleteTrashFolder(folderId),
      );
    },
    [isAuthenticated, runAction],
  );

  const handleClearAll = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    await runAction("trash-clear-all", deleteAllTrashItems);
  }, [isAuthenticated, runAction]);

  const items = isAuthenticated
    ? (trashItemsQuery.data?.pages.flatMap((page) => page.items) ?? [])
    : [];
  const isLoading = isAuthenticated && trashItemsQuery.isPending;
  const error = actionError ?? (trashItemsQuery.isError ? "load" : null);

  return {
    items,
    activeFolders,
    fetchNextPage: trashItemsQuery.fetchNextPage,
    hasNextPage: Boolean(trashItemsQuery.hasNextPage),
    isLoading,
    isFetchingNextPage: trashItemsQuery.isFetchingNextPage,
    error,
    hasItems: items.length > 0,
    pendingActionKey,
    reload,
    handleRestoreClip,
    handleDeleteClip,
    handleRestoreFolder,
    handleDeleteFolder,
    handleClearAll,
  };
};
