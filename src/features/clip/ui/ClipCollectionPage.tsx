"use client";

import { useTranslations } from "next-intl";
import type { Clip } from "@/features/clip/model/clip";
import { ClipCopyToast } from "@/features/clip/ui/ClipCopyToast";
import { ClipResultsSection } from "@/features/clip/ui/ClipResultsSection";
import { FilterBar, type FilterType } from "@/features/clip/ui/FilterBar";

// 필터, 조회 상태, 클립 목록과 복사 알림을 공통 컬렉션 화면으로 조합합니다.
interface ClipCollectionPageProps {
  activeFilter: FilterType;
  clips: Clip[];
  copyToastPosition: { x: number; y: number } | null;
  hasNextPage?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  onCopy: (clip: Clip, event: React.MouseEvent<HTMLButtonElement>) => void;
  onFetchNextPage: () => void;
  onFilterChange: (filter: FilterType) => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onToggleFavorite?: (clip: Clip) => void;
  searchQuery: string;
}

export function ClipCollectionPage({
  activeFilter,
  clips,
  copyToastPosition,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  onCopy,
  onFetchNextPage,
  onFilterChange,
  onRetry,
  onSearchChange,
  onToggleFavorite,
  searchQuery,
}: ClipCollectionPageProps) {
  const t = useTranslations("clips");
  const hasClipLoadError = isError && clips.length === 0;

  return (
    <div className="bg-background relative flex h-full flex-col">
      {!hasClipLoadError ? (
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          showStatus={false}
          countLabel={t("count", { count: clips.length })}
        />
      ) : null}
      <ClipResultsSection
        clips={clips}
        hasNextPage={hasNextPage}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        onFetchNextPage={onFetchNextPage}
        onRetry={onRetry}
        onCopy={onCopy}
        onToggleFavorite={onToggleFavorite}
      />
      <ClipCopyToast label={t("copyToast")} position={copyToastPosition} />
    </div>
  );
}
