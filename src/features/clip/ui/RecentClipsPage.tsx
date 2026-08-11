"use client";

import { useClipCollection } from "@/features/clip/hooks/useClipCollection";
import { ClipCollectionPage } from "@/features/clip/ui/ClipCollectionPage";

// 최근 사용한 클립 데이터를 공통 컬렉션 화면에 연결합니다.
export function RecentClipsPage() {
  const { commands, feedback, filter, results } = useClipCollection({
    recent: true,
  });

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
      searchQuery={filter.searchQuery}
    />
  );
}
