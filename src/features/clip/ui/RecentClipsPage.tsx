"use client";

import { useClipCollection } from "@/features/clip/hooks/useClipCollection";
import { ClipCollectionPage } from "@/features/clip/ui/ClipCollectionPage";

// 최근 사용한 클립 데이터를 공통 컬렉션 화면에 연결합니다.
export function RecentClipsPage() {
  const {
    commands,
    filter,
    isFavoritePending,
    pendingFavoriteClipId,
    results,
  } = useClipCollection({ recent: true, supportsFavoriteToggle: true });

  return (
    <ClipCollectionPage
      activeFilter={filter.activeFilter}
      clips={results.clips}
      hasNextPage={results.hasNextPage}
      isError={results.isError}
      isFetchingNextPage={results.isFetchingNextPage}
      isLoading={results.isLoading}
      onCopy={(clip) => {
        void commands.copyClip(clip);
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
