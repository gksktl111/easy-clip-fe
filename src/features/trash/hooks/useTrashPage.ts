"use client";

import { useCallback, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { CLIP_QUERY_KEY } from "@/features/clip/hooks/useInfiniteClips";
import { FOLDER_QUERY_KEY } from "@/features/folder/hooks/useFolders";
import { useFolders } from "@/features/folder/hooks/useFolders";
import {
  deleteAllTrashItems,
  deleteTrashItems,
  deleteTrashClip,
  deleteTrashFolder,
  fetchTrashItems,
  restoreTrashClip,
  restoreTrashFolder,
  restoreTrashItems,
} from "@/features/trash/api/trashApi";
import { TrashItemMutationDto } from "@/features/trash/model/trash.dto";
import {
  invalidateTrashQueries,
  TRASH_QUERY_KEYS,
} from "@/features/trash/service/trashQueryCache";
import { ApiError } from "@/shared/lib/apiClient";
import { waitForMinimumLoading } from "@/shared/lib/loading";

type TrashPageError = "load" | "action" | "restoreConflict";

export const useTrashPage = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();
  const { folders: activeFolders } = useFolders();
  const [actionError, setActionError] = useState<TrashPageError | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const pendingActionKeyRef = useRef<string | null>(null);

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

  const refreshRelatedData = useCallback(async () => {
    await Promise.all([
      invalidateTrashQueries(queryClient),
      queryClient.invalidateQueries({ queryKey: [FOLDER_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [CLIP_QUERY_KEY] }),
    ]);
  }, [queryClient]);

  const runAction = useCallback(
    async (actionKey: string, action: () => Promise<unknown>) => {
      if (pendingActionKeyRef.current) {
        return false;
      }

      pendingActionKeyRef.current = actionKey;
      setPendingActionKey(actionKey);
      setActionError(null);

      try {
        await action();
        await refreshRelatedData();
        return true;
      } catch (error) {
        const isRestoreConflict =
          actionKey.includes("restore") &&
          error instanceof ApiError &&
          error.status === 409;

        setActionError(
          isRestoreConflict ? "restoreConflict" : "action",
        );
        await refreshRelatedData().catch(() => undefined);
        return false;
      } finally {
        pendingActionKeyRef.current = null;
        setPendingActionKey(null);
      }
    },
    [refreshRelatedData],
  );

  const handleRestoreClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated) {
        return;
      }

      return runAction(`clip-restore-${clipId}`, () => restoreTrashClip(clipId));
    },
    [isAuthenticated, runAction],
  );

  const handleRestoreItems = useCallback(
    async (itemsToRestore: TrashItemMutationDto[]) => {
      if (!isAuthenticated || itemsToRestore.length === 0) {
        return false;
      }

      return runAction("trash-restore-selected", () =>
        restoreTrashItems(itemsToRestore),
      );
    },
    [isAuthenticated, runAction],
  );

  const handleDeleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated) {
        return;
      }

      return runAction(`clip-delete-${clipId}`, () => deleteTrashClip(clipId));
    },
    [isAuthenticated, runAction],
  );

  const handleDeleteItems = useCallback(
    async (itemsToDelete: TrashItemMutationDto[]) => {
      if (!isAuthenticated || itemsToDelete.length === 0) {
        return;
      }

      return runAction("trash-delete-selected", () =>
        deleteTrashItems(itemsToDelete),
      );
    },
    [isAuthenticated, runAction],
  );

  const handleRestoreFolder = useCallback(
    async (folderId: string) => {
      if (!isAuthenticated) {
        return;
      }

      return runAction(`folder-restore-${folderId}`, () =>
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

      return runAction(`folder-delete-${folderId}`, () =>
        deleteTrashFolder(folderId),
      );
    },
    [isAuthenticated, runAction],
  );

  const handleClearAll = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    return runAction("trash-clear-all", deleteAllTrashItems);
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
    handleRestoreItems,
    handleDeleteClip,
    handleDeleteItems,
    handleRestoreFolder,
    handleDeleteFolder,
    handleClearAll,
  };
};
