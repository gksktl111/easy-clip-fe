"use client";

import { useClipCollection } from "@/features/clip/hooks/useClipCollection";
import { ClipCollectionPage } from "@/features/clip/ui/ClipCollectionPage";

// 즐겨찾기 클립 데이터와 즐겨찾기 해제 액션을 공통 컬렉션 화면에 연결합니다.
export function FavoriteClipsPage() {
  const {
    commands,
    feedback,
    filter,
    isFavoritePending,
    pendingFavoriteClipId,
    results,
  } = useClipCollection({ favorite: true, supportsFavoriteToggle: true });

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
        void commands.copyClip(clip, {
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
      onToggleFavorite={commands.toggleFavorite}
      isFavoriteMutationPending={isFavoritePending}
      pendingFavoriteClipId={pendingFavoriteClipId}
      searchQuery={filter.searchQuery}
    />
  );
}
