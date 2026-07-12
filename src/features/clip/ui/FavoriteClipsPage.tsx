"use client";

import { useFavoriteClipsPage } from "@/features/clip/hooks/useFavoriteClipsPage";
import { ClipCollectionPage } from "@/features/clip/ui/ClipCollectionPage";

// 즐겨찾기 클립 데이터와 즐겨찾기 해제 액션을 공통 컬렉션 화면에 연결합니다.
export function FavoriteClipsPage() {
  const { actions, feedback, filter, results } = useFavoriteClipsPage();

  return (
    <ClipCollectionPage
      activeFilter={filter.activeFilter}
      clips={results.clips}
      copyToastPosition={feedback.copyToast}
      hasNextPage={results.hasNextPage}
      isError={results.isError}
      isFetchingNextPage={results.isFetchingNextPage}
      isLoading={results.isLoading}
      onCopy={(clip, event) => {
        void actions.copyClip(clip, {
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onFetchNextPage={() => {
        void results.fetchNextPage();
      }}
      onFilterChange={filter.changeFilter}
      onRetry={() => {
        void results.refetch();
      }}
      onSearchChange={filter.changeSearchQuery}
      onToggleFavorite={actions.toggleFavorite}
      searchQuery={filter.searchQuery}
    />
  );
}
