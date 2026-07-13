"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth";
import { fetchTrashItems } from "@/features/trash/api/trashApi";
import { TRASH_QUERY_KEYS } from "@/features/trash/service/trashQueryCache";
import { waitForMinimumLoading } from "@/shared/lib/loading";

// 인증 사용자의 휴지통 항목을 cursor 기반으로 조회하고 평탄화된 목록을 제공합니다.
export const useTrashItemsQuery = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const trashItemsQuery = useInfiniteQuery({
    queryKey: TRASH_QUERY_KEYS.items(session?.user?.id ?? null),
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

  return {
    fetchNextPage: trashItemsQuery.fetchNextPage,
    hasNextPage: Boolean(trashItemsQuery.hasNextPage),
    isError: trashItemsQuery.isError,
    isFetchingNextPage: trashItemsQuery.isFetchingNextPage,
    isLoading: isAuthenticated && trashItemsQuery.isPending,
    items: isAuthenticated
      ? (trashItemsQuery.data?.pages.flatMap((page) => page.items) ?? [])
      : [],
    refetch: trashItemsQuery.refetch,
  };
};
