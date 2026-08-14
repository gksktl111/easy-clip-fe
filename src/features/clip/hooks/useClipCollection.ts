"use client";

import { useClipCollectionFilter } from "@/features/clip/hooks/useClipCollectionFilter";
import { useClipCopyAction } from "@/features/clip/hooks/useClipCopyAction";
import { useClipFavoriteMutation } from "@/features/clip/mutations/useClipFavoriteMutation";
import { useInfiniteClipsQuery } from "@/features/clip/queries/useInfiniteClipsQuery";

interface UseClipCollectionOptions {
  favorite?: boolean;
  recent?: boolean;
  supportsFavoriteToggle?: boolean;
}

// 컬렉션 화면에서 공유하는 필터, 조회, 복사와 즐겨찾기 명령을 조합합니다.
export const useClipCollection = ({
  favorite = false,
  recent = false,
  supportsFavoriteToggle = false,
}: UseClipCollectionOptions) => {
  const filter = useClipCollectionFilter();
  const query = useInfiniteClipsQuery({
    favorite,
    recent,
    filter: filter.activeFilter,
    searchQuery: filter.debouncedSearchQuery,
  });
  const copy = useClipCopyAction({
    isAuthenticated: query.isAuthenticated,
  });
  const favoriteMutation = useClipFavoriteMutation({
    isAuthenticated: query.isAuthenticated,
  });

  return {
    commands: {
      copyClip: copy.copyClip,
      toggleFavorite: supportsFavoriteToggle
        ? favoriteMutation.toggleFavorite
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
    isFavoritePending: supportsFavoriteToggle && favoriteMutation.isPending,
    pendingFavoriteClipId: supportsFavoriteToggle
      ? favoriteMutation.pendingClipId
      : null,
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
