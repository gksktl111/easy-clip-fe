"use client";

import { useRecentClipsPage } from "@/features/clip/hooks/useRecentClipsPage";
import { ClipCollectionPage } from "@/features/clip/ui/ClipCollectionPage";

// 최근 사용한 클립 데이터를 공통 컬렉션 화면에 연결합니다.
export function RecentClipsPage() {
  const {
    activeFilter,
    copyToast,
    fetchNextPage,
    filteredClips,
    handleCopy,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetchClips,
    searchQuery,
    setActiveFilter,
    setSearchQuery,
  } = useRecentClipsPage();

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
      searchQuery={searchQuery}
    />
  );
}
