"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { ApiError } from "@/shared/lib/apiClient";
import { AccessChangedError } from "@/shared/access/accessEvents";
import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTrashItems } from "@/features/trash/api/trashApi";
import { TRASH_QUERY_KEYS } from "@/features/trash/service/trashQueryCache";
import { useAuth } from "@/features/auth";
import { waitForMinimumLoading } from "@/shared/lib/loading";

// 인증 사용자의 휴지통 항목을 cursor 기반으로 조회하고 평탄화된 목록을 제공합니다.
export const useTrashItemsQuery = () => {
  const { user } = useAuth();
  const access = useResourceAccess();
  const canRead = access.status === "ready";
  const isAuthenticated = Boolean(user);
  const queryClient = useQueryClient();
  const queryKey = [...TRASH_QUERY_KEYS.items(user?.id ?? null), access.scope];
  const identity = JSON.stringify(queryKey);
  const restarted = useRef(new Set<string>());
  const trashItemsQuery = useInfiniteQuery({
    queryKey,
    enabled: isAuthenticated && canRead,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const loadingStartedAt = Date.now();

      try {
        return await fetchTrashItems({ cursor: pageParam }, signal);
      } finally {
        await waitForMinimumLoading(loadingStartedAt);
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    retry: (count, error) =>
      !(error instanceof AccessChangedError) &&
      !(error instanceof ApiError && error.status < 500) &&
      count < 3,
  });
  useEffect(() => {
    if (
      !canRead ||
      !trashItemsQuery.isFetchNextPageError ||
      !(trashItemsQuery.error instanceof ApiError) ||
      trashItemsQuery.error.status !== 404 ||
      restarted.current.has(identity)
    )
      return;
    restarted.current.add(identity);
    void queryClient.resetQueries({
      queryKey: JSON.parse(identity),
      exact: true,
    });
  }, [
    canRead,
    identity,
    trashItemsQuery.isFetchNextPageError,
    trashItemsQuery.error,
    queryClient,
  ]);
  const items = useMemo(
    () =>
      isAuthenticated && canRead
        ? (trashItemsQuery.data?.pages.flatMap((page) =>
            page.items.filter(
              (item) =>
                item.itemType === "FOLDER" ||
                access.folderLocks[item.folderId] === false,
            ),
          ) ?? [])
        : [],
    [isAuthenticated, canRead, access.folderLocks, trashItemsQuery.data],
  );

  return {
    fetchNextPage: trashItemsQuery.fetchNextPage,
    hasNextPage: Boolean(trashItemsQuery.hasNextPage),
    isError: trashItemsQuery.isError,
    isFetchingNextPage: trashItemsQuery.isFetchingNextPage,
    isLoading: isAuthenticated && trashItemsQuery.isPending,
    items,
    refetch: () => {
      restarted.current.delete(identity);
      return queryClient.resetQueries({ queryKey, exact: true });
    },
  };
};
