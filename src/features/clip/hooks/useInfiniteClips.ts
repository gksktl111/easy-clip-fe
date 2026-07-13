"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchClips } from "@/features/clip/api/clipApi";
import type { Clip, ClipFilter } from "@/features/clip/model/clip";
import type { FetchClipsQueryDto } from "@/features/clip/model/clip.dto";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { CLIP_QUERY_KEY } from "@/features/clip/service/clipQueryCache";
import { waitForMinimumLoading } from "@/shared/lib/loading";
import { useSession } from "@/shared/session/useSession";

const mapFilterToApiType = (filter: ClipFilter): FetchClipsQueryDto["type"] => {
  if (filter === "all") {
    return "ALL";
  }

  return filter.toUpperCase() as FetchClipsQueryDto["type"];
};

interface UseInfiniteClipsOptions {
  folderId?: string;
  favorite?: boolean;
  recent?: boolean;
  filter: ClipFilter;
  searchQuery?: string;
  enabled?: boolean;
}

// 인증 상태와 조회 조건에 맞는 클립을 무한 query로 조회하고 도메인 모델로 변환합니다.
export const useInfiniteClips = ({
  folderId,
  favorite,
  recent,
  filter,
  searchQuery = "",
  enabled = true,
}: UseInfiniteClipsOptions) => {
  const { user } = useSession();
  const isAuthenticated = Boolean(user);
  const normalizedSearchQuery = searchQuery.trim();
  const queryKey = [
    CLIP_QUERY_KEY,
    {
      folderId: folderId ?? null,
      favorite: Boolean(favorite),
      recent: Boolean(recent),
      type: mapFilterToApiType(filter),
      q: normalizedSearchQuery,
    },
  ] as const;

  const query = useInfiniteQuery({
    queryKey,
    enabled: isAuthenticated && enabled,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      if (!isAuthenticated) {
        return {
          items: [],
          hasMore: false,
          nextCursor: null,
        };
      }

      const loadingStartedAt = Date.now();

      try {
        return await fetchClips({
          folderId,
          favorite,
          recent,
          type: mapFilterToApiType(filter),
          q: normalizedSearchQuery,
          cursor: pageParam,
        });
      } finally {
        await waitForMinimumLoading(loadingStartedAt);
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    placeholderData: (previousData) => previousData,
  });

  const clips = useMemo<Clip[]>(
    () =>
      query.data?.pages.flatMap((page) =>
        page.items.map((clip) => mapClipResponse(clip)),
      ) ?? [],
    [query.data],
  );

  return {
    clips,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    isAuthenticated,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: isAuthenticated && enabled && query.isPending,
    refetch: query.refetch,
  };
};
