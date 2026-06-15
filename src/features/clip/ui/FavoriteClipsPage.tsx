"use client";

import { useTranslations } from "next-intl";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { useFavoriteClipsPage } from "@/features/clip/hooks/useFavoriteClipsPage";
import { FilterBar } from "@/features/clip/ui/FilterBar";

export function FavoriteClipsPage() {
  const t = useTranslations("clips");
  const {
    activeFilter,
    copyToast,
    filteredClips,
    handleCopy,
    handleToggleFavorite,
    isLoading,
    setActiveFilter,
  } = useFavoriteClipsPage();

  return (
    <div className="bg-background relative flex h-full flex-col">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showStatus={false}
        countLabel={t("count", { count: filteredClips.length })}
      />
      <ClipResultsSection
        clips={filteredClips}
        isLoading={isLoading}
        onCopy={handleCopy}
        onToggleFavorite={handleToggleFavorite}
      />
      <ClipCopyToast label={t("copyToast")} position={copyToast} />
    </div>
  );
}
