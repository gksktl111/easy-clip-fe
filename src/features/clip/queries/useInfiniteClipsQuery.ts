"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Clip, ClipFilter } from "@/features/clip/model/clip";
import { clipInfiniteQueryOptions } from "@/features/clip/queries/clipInfiniteQueryOptions";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { useAuth } from "@/shared/auth/useAuth";

interface UseInfiniteClipsQueryOptions {
  folderId?: string;
  favorite?: boolean;
  recent?: boolean;
  filter: ClipFilter;
  searchQuery?: string;
  enabled?: boolean;
}

// 인증 상태와 조회 조건에 맞는 클립을 무한 query로 조회하고 도메인 모델로 변환합니다.
export const useInfiniteClipsQuery = ({
  folderId,
  favorite,
  recent,
  filter,
  searchQuery = "",
  enabled = true,
}: UseInfiniteClipsQueryOptions) => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const isQueryEnabled = isAuthenticated && enabled;
  const query = useInfiniteQuery(
    clipInfiniteQueryOptions({
      folderId,
      favorite,
      recent,
      filter,
      searchQuery,
      enabled: isQueryEnabled,
    }),
  );

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
    isLoading: isQueryEnabled && query.isPending,
    refetch: query.refetch,
  };
};
