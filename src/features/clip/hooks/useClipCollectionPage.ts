"use client";

import { useClipCollectionFilter } from "@/features/clip/hooks/useClipCollectionFilter";
import { useClipCopyAction } from "@/features/clip/hooks/useClipCopyAction";
import { useClipFavoriteAction } from "@/features/clip/hooks/useClipFavoriteAction";
import { useInfiniteClips } from "@/features/clip/hooks/useInfiniteClips";

interface UseClipCollectionPageOptions {
  favorite?: boolean;
  recent?: boolean;
  supportsFavoriteToggle?: boolean;
}

// 필터와 클립 query, 복사 및 선택적 즐겨찾기 액션을 컬렉션 페이지 계약으로 조합합니다.
export const useClipCollectionPage = ({
  favorite = false,
  recent = false,
  supportsFavoriteToggle = false,
}: UseClipCollectionPageOptions) => {
  const filter = useClipCollectionFilter();
  const query = useInfiniteClips({
    favorite,
    recent,
    filter: filter.activeFilter,
    searchQuery: filter.debouncedSearchQuery,
  });
  const copy = useClipCopyAction({
    isAuthenticated: query.isAuthenticated,
  });
  const favoriteAction = useClipFavoriteAction({
    isAuthenticated: query.isAuthenticated,
    isDisabled: !supportsFavoriteToggle,
  });

  return {
    actions: {
      copyClip: copy.copyClip,
      toggleFavorite: supportsFavoriteToggle
        ? favoriteAction.toggleFavorite
        : undefined,
    },
    feedback: {
      copyToast: copy.copyToast,
    },
    filter: {
      activeFilter: filter.activeFilter,
      changeFilter: filter.changeFilter,
      changeSearchQuery: filter.changeSearchQuery,
      searchQuery: filter.searchQuery,
    },
    results: {
      clips: query.clips,
      fetchNextPage: query.fetchNextPage,
      hasNextPage: query.hasNextPage,
      isError: query.isError,
      isFetchingNextPage: query.isFetchingNextPage,
      isLoading: query.isLoading,
      refetch: query.refetch,
    },
  };
};
