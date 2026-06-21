"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  likeClip,
  recordClipView,
  unlikeClip,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import {
  CLIP_QUERY_KEY,
  useInfiniteClips,
} from "@/features/clip/hooks/useInfiniteClips";
import { Clip } from "@/features/clip/model/clip";
import { FilterType } from "@/features/clip/ui/FilterBar";

export const useFavoriteClipsPage = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { copyToast, showCopyToast } = useCopyToast();
  const {
    accessToken,
    clips,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteClips({
    favorite: true,
    filter: activeFilter,
  });

  const refreshClipQueries = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [CLIP_QUERY_KEY] }),
    [queryClient],
  );

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      showCopyToast(event.clientX, event.clientY);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      if (accessToken) {
        await recordClipView(accessToken, clip.id);
      }
    },
    [accessToken, showCopyToast],
  );

  const handleToggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!accessToken) {
        return;
      }

      if (clip.isFavorite) {
        await unlikeClip(accessToken, clip.id);
      } else {
        await likeClip(accessToken, clip.id);
      }

      await refreshClipQueries();
    },
    [accessToken, refreshClipQueries],
  );

  return {
    activeFilter,
    copyToast,
    fetchNextPage,
    filteredClips: clips,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading: isPending,
    setActiveFilter,
    handleCopy,
    handleToggleFavorite,
  };
};
