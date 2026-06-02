"use client";

import { useRecentClipsPage } from "@/domains/clips/hooks/useRecentClipsPage";
import { ClipList } from "@/domains/clips/ui/ClipList";
import { DeleteAllButton } from "@/domains/clips/ui/DeleteAllButton";
import { EmptyState } from "@/domains/clips/ui/EmptyState";
import { FilterBar } from "@/domains/clips/ui/FilterBar";

export function RecentClipsPage() {
  const {
    activeFilter,
    clearAll,
    copyToast,
    filteredClips,
    handleCopy,
    hasClips,
    searchQuery,
    setActiveFilter,
    setSearchQuery,
  } = useRecentClipsPage();

  return (
    <div className="bg-background flex h-full flex-col">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showStatus={false}
        countLabel={`${filteredClips.length} clips`}
      />
      {filteredClips.length ? (
        <ClipList clips={filteredClips} onCopy={handleCopy} />
      ) : (
        <EmptyState />
      )}
      <DeleteAllButton disabled={!hasClips} onClick={clearAll} />

      {copyToast ? (
        <div
          className="fixed z-50 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md"
          style={{ left: copyToast.x + 12, top: copyToast.y + 12 }}
        >
          COPY!
        </div>
      ) : null}
    </div>
  );
}
