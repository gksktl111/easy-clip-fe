"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { fetchClips } from "@/features/clip/api/clipApi";
import { Clip } from "@/features/clip/model/clip";
import { FetchClipsQueryDto } from "@/features/clip/model/clip.dto";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { FilterType } from "@/features/clip/ui/FilterBar";
import { waitForMinimumLoading } from "@/shared/lib/loading";

const mapFilterToApiType = (
  filter: FilterType,
): FetchClipsQueryDto["type"] => {
  if (filter === "all") {
    return "ALL";
  }

  return filter.toUpperCase() as FetchClipsQueryDto["type"];
};

interface UseInfiniteClipsOptions {
  folderId?: string;
  favorite?: boolean;
  recent?: boolean;
  filter: FilterType;
  searchQuery?: string;
  enabled?: boolean;
}

export const CLIP_QUERY_KEY = "clips";

export const useInfiniteClips = ({
  folderId,
  favorite,
  recent,
  filter,
  searchQuery = "",
  enabled = true,
}: UseInfiniteClipsOptions) => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
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
    ...query,
    isAuthenticated,
    clips,
    isPending: isAuthenticated && enabled && query.isPending,
    queryKey,
  };
};
