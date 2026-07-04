"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { recordClipView } from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { useInfiniteClips } from "@/features/clip/hooks/useInfiniteClips";
import { Clip } from "@/features/clip/model/clip";
import { copyClipToClipboard } from "@/features/clip/service/clipClipboard";
import {
  invalidateClipQueries,
  moveClipToRecentCache,
} from "@/features/clip/service/clipQueryCache";
import { FilterType } from "@/features/clip/ui/FilterBar";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { notifyError } from "@/shared/lib/toast";

export const useRecentClipsPage = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const { copyToast, showCopyToast } = useCopyToast();
  const {
    clips,
    fetchNextPage,
    hasNextPage,
    isAuthenticated,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteClips({
    recent: true,
    filter: activeFilter,
    searchQuery: debouncedSearchQuery,
  });

  const refreshClipQueries = useCallback(
    () => invalidateClipQueries(queryClient),
    [queryClient],
  );

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      try {
        await copyClipToClipboard(clip);
      } catch {
        notifyError("클립을 복사하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      showCopyToast(event.clientX, event.clientY);

      if (isAuthenticated) {
        await recordClipView(clip.id);
        moveClipToRecentCache(queryClient, clip.id);
        void refreshClipQueries();
      }
    },
    [isAuthenticated, queryClient, refreshClipQueries, showCopyToast],
  );

  return {
    activeFilter,
    copyToast,
    fetchNextPage,
    filteredClips: clips,
    hasNextPage: Boolean(hasNextPage),
    isError,
    isFetchingNextPage,
    isLoading: isPending,
    searchQuery,
    refetchClips: refetch,
    setActiveFilter,
    setSearchQuery,
    handleCopy,
  };
};
