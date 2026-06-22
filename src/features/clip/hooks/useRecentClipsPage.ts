"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { recordClipView } from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { useInfiniteClips } from "@/features/clip/hooks/useInfiniteClips";
import { Clip } from "@/features/clip/model/clip";
import { invalidateClipQueries } from "@/features/clip/service/clipQueryCache";
import { FilterType } from "@/features/clip/ui/FilterBar";

export const useRecentClipsPage = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { copyToast, showCopyToast } = useCopyToast();
  const {
    clips,
    fetchNextPage,
    hasNextPage,
    isAuthenticated,
    isFetchingNextPage,
    isPending,
  } = useInfiniteClips({
    recent: true,
    filter: activeFilter,
    searchQuery,
  });

  const refreshClipQueries = useCallback(
    () => invalidateClipQueries(queryClient),
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

      if (isAuthenticated) {
        await recordClipView(clip.id);
        await refreshClipQueries();
      }
    },
    [isAuthenticated, refreshClipQueries, showCopyToast],
  );

  return {
    activeFilter,
    copyToast,
    fetchNextPage,
    filteredClips: clips,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading: isPending,
    searchQuery,
    hasClips: clips.length > 0,
    setActiveFilter,
    setSearchQuery,
    clearAll: () => undefined,
    handleCopy,
  };
};
