"use client";

import { useTranslations } from "next-intl";
import { useRecentClipsPage } from "@/features/clip/hooks/useRecentClipsPage";
import { ClipList } from "@/features/clip/ui/ClipList";
import { DeleteAllButton } from "@/features/clip/ui/DeleteAllButton";
import { EmptyState } from "@/features/clip/ui/EmptyState";
import { FilterBar } from "@/features/clip/ui/FilterBar";

export function RecentClipsPage() {
  const t = useTranslations("clips");
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
    <div className="bg-background relative flex h-full flex-col">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showStatus={false}
        countLabel={t("count", { count: filteredClips.length })}
      />
      {filteredClips.length ? (
        <ClipList clips={filteredClips} onCopy={handleCopy} />
      ) : (
        <EmptyState />
      )}
      <DeleteAllButton disabled={!hasClips} onClick={clearAll} />

      {copyToast ? (
        <div
          className="fixed z-50 rounded-full bg-(--chip-bg) px-3 py-1.5 text-xs font-semibold text-(--chip-text) shadow-md"
          style={{ left: copyToast.x + 12, top: copyToast.y + 12 }}
        >
          {t("copyToast")}
        </div>
      ) : null}
    </div>
  );
}
