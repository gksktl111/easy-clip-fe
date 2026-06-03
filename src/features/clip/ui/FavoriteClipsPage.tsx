"use client";

import { useFavoriteClipsPage } from "@/features/clip/hooks/useFavoriteClipsPage";
import { ClipList } from "@/features/clip/ui/ClipList";
import { EmptyState } from "@/features/clip/ui/EmptyState";
import { FilterBar } from "@/features/clip/ui/FilterBar";

export function FavoriteClipsPage() {
  const {
    activeFilter,
    copyToast,
    filteredClips,
    handleCopy,
    handleToggleFavorite,
    setActiveFilter,
  } = useFavoriteClipsPage();

  return (
    <div className="bg-background flex h-full flex-col">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showStatus={false}
        countLabel={`${filteredClips.length} clips`}
      />
      {filteredClips.length ? (
        <ClipList
          clips={filteredClips}
          onCopy={handleCopy}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <EmptyState />
      )}

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
