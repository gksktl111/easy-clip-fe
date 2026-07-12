"use client";

import { useFavoriteClipsPage } from "@/features/clip/hooks/useFavoriteClipsPage";
import { ClipCollectionPage } from "@/features/clip/ui/ClipCollectionPage";

// 즐겨찾기 클립 데이터와 즐겨찾기 해제 액션을 공통 컬렉션 화면에 연결합니다.
export function FavoriteClipsPage() {
  const {
    activeFilter,
    copyToast,
    fetchNextPage,
    filteredClips,
    handleCopy,
    handleToggleFavorite,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetchClips,
    searchQuery,
    setActiveFilter,
    setSearchQuery,
  } = useFavoriteClipsPage();

  return (
    <ClipCollectionPage
      activeFilter={activeFilter}
      clips={filteredClips}
      copyToastPosition={copyToast}
      hasNextPage={hasNextPage}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      onCopy={handleCopy}
      onFetchNextPage={() => {
        void fetchNextPage();
      }}
      onFilterChange={setActiveFilter}
      onRetry={() => {
        void refetchClips();
      }}
      onSearchChange={setSearchQuery}
      onToggleFavorite={handleToggleFavorite}
      searchQuery={searchQuery}
    />
  );
}
