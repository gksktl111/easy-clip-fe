"use client";

import { useTranslations } from "next-intl";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { useRecentClipsPage } from "@/features/clip/hooks/useRecentClipsPage";
import { FilterBar } from "@/features/clip/ui/FilterBar";

export function RecentClipsPage() {
  const t = useTranslations("clips");
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
  const hasClipLoadError = isError && filteredClips.length === 0;

  return (
    <div className="bg-background relative flex h-full flex-col">
      {!hasClipLoadError ? (
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showStatus={false}
          countLabel={t("count", { count: filteredClips.length })}
        />
      ) : null}
      <ClipResultsSection
        clips={filteredClips}
        hasNextPage={hasNextPage}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        onFetchNextPage={() => {
          void fetchNextPage();
        }}
        onRetry={() => {
          void refetchClips();
        }}
        onCopy={handleCopy}
      />
      <ClipCopyToast label={t("copyToast")} position={copyToast} />
    </div>
  );
}
