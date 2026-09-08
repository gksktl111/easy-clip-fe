"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { ApiError } from "@/shared/lib/apiClient";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import type { Clip, ClipFilter } from "@/features/clip/model/clip";
import { clipInfiniteQueryOptions } from "@/features/clip/queries/clipInfiniteQueryOptions";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { useAuth } from "@/features/auth";

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
  const access = useResourceAccess();
  const canRead =
    access.status === "ready" &&
    (!folderId || access.folderLocks[folderId] === false);
  const isQueryEnabled = isAuthenticated && enabled && canRead;
  const queryClient = useQueryClient();
  const options = clipInfiniteQueryOptions({
    accessScope: access.scope,
    folderId,
    favorite,
    recent,
    filter,
    searchQuery,
    enabled: isQueryEnabled,
  });
  const query = useInfiniteQuery(options);
  const restarted = useRef(new Set<string>());
  const identity = JSON.stringify(options.queryKey);
  useEffect(() => {
    if (
      !canRead ||
      !query.isFetchNextPageError ||
      !(query.error instanceof ApiError) ||
      query.error.status !== 404 ||
      restarted.current.has(identity)
    )
      return;
    restarted.current.add(identity);
    void queryClient.resetQueries({
      queryKey: JSON.parse(identity),
      exact: true,
    });
  }, [canRead, identity, query.isFetchNextPageError, query.error, queryClient]);

  const clips = useMemo<Clip[]>(
    () =>
      query.data?.pages.flatMap((page) =>
        page.items.map((clip) => mapClipResponse(clip)),
      ) ?? [],
    [query.data],
  );

  return {
    clips: canRead
      ? clips.filter(
          (clip) =>
            clip.folderId && access.folderLocks[clip.folderId] === false,
        )
      : [],
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    isAuthenticated,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: isQueryEnabled && query.isPending,
    refetch: () => {
      restarted.current.delete(identity);
      return queryClient.resetQueries({
        queryKey: options.queryKey,
        exact: true,
      });
    },
  };
};
