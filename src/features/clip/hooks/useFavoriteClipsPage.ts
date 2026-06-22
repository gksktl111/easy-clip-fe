"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  likeClip,
  recordClipView,
  unlikeClip,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { useInfiniteClips } from "@/features/clip/hooks/useInfiniteClips";
import { Clip } from "@/features/clip/model/clip";
import { updateClipFavoriteCache } from "@/features/clip/service/clipQueryCache";
import { FilterType } from "@/features/clip/ui/FilterBar";

export const useFavoriteClipsPage = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { copyToast, showCopyToast } = useCopyToast();
  const {
    clips,
    fetchNextPage,
    hasNextPage,
    isAuthenticated,
    isFetchingNextPage,
    isPending,
  } = useInfiniteClips({
    favorite: true,
    filter: activeFilter,
  });

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      showCopyToast(event.clientX, event.clientY);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      if (isAuthenticated) {
        await recordClipView(clip.id);
      }
    },
    [isAuthenticated, showCopyToast],
  );

  const handleToggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!isAuthenticated) {
        return;
      }

      const nextFavorite = !clip.isFavorite;
      const rollbackFavorite = updateClipFavoriteCache(
        queryClient,
        clip.id,
        nextFavorite,
      );

      try {
        if (nextFavorite) {
          await likeClip(clip.id);
        } else {
          await unlikeClip(clip.id);
        }
      } catch {
        rollbackFavorite();
      }
    },
    [isAuthenticated, queryClient],
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
