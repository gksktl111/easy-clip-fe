"use client";

import { useTranslations } from "next-intl";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { useRecentClipsPage } from "@/features/clip/hooks/useRecentClipsPage";
import { DeleteAllButton } from "@/features/clip/ui/DeleteAllButton";
import { FilterBar } from "@/features/clip/ui/FilterBar";

export function RecentClipsPage() {
  const t = useTranslations("clips");
  const {
    activeFilter,
    clearAll,
    copyToast,
    fetchNextPage,
    filteredClips,
    handleCopy,
    hasNextPage,
    hasClips,
    isFetchingNextPage,
    isLoading,
    searchQuery,
    setActiveFilter,
    setSearchQuery,
  } = useRecentClipsPage();

  return (
    <div className="bg-background relative flex h-full flex-col">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showStatus={false}
        countLabel={t("count", { count: filteredClips.length })}
      />
      <ClipResultsSection
        clips={filteredClips}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        onFetchNextPage={() => {
          void fetchNextPage();
        }}
        onCopy={handleCopy}
      />
      <DeleteAllButton disabled={!hasClips} onClick={clearAll} />
      <ClipCopyToast label={t("copyToast")} position={copyToast} />
    </div>
  );
}
