"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import type { Clip } from "@/features/clip/model/clip";
import { ClipErrorState } from "@/features/clip/ui/ClipErrorState";
import { ClipList } from "@/features/clip/ui/ClipList";
import { ClipListSkeleton } from "@/features/clip/ui/ClipListSkeleton";
import { EmptyState } from "@/features/clip/ui/EmptyState";

const EMPTY_SELECTED_CLIP_IDS = new Set<string>();

// 클립 조회 상태에 따라 로딩, 오류, 빈 상태 또는 페이지네이션 목록을 표시합니다.
interface ClipResultsSectionProps {
  clips: Clip[];
  isError?: boolean;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  onRetry?: () => void;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (
    event: React.MouseEvent<HTMLButtonElement>,
    clip: Clip,
  ) => void;
  isDeleteMode?: boolean;
  isInteractionDisabled?: boolean;
  selectedClipIds?: Set<string>;
  onToggleSelected?: (clipId: string) => void;
}

export function ClipResultsSection({
  clips,
  isError = false,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
  onRetry,
  onCopy,
  onToggleFavorite,
  onContextMenu,
  isDeleteMode = false,
  isInteractionDisabled = false,
  selectedClipIds = EMPTY_SELECTED_CLIP_IDS,
  onToggleSelected,
}: ClipResultsSectionProps) {
  const hasTriggeredInViewRef = useRef(false);
  const { ref, inView } = useInView({
    rootMargin: "240px 0px",
  });

  useEffect(() => {
    if (!inView) {
      hasTriggeredInViewRef.current = false;
      return;
    }

    if (!inView || !hasNextPage || isFetchingNextPage || !onFetchNextPage) {
      return;
    }

    if (hasTriggeredInViewRef.current) {
      return;
    }

    hasTriggeredInViewRef.current = true;
    onFetchNextPage();
  }, [hasNextPage, inView, isFetchingNextPage, onFetchNextPage]);

  if (isLoading) {
    return <ClipListSkeleton />;
  }

  if (isError && !clips.length) {
    return <ClipErrorState onRetry={onRetry} />;
  }

  if (!clips.length) {
    return <EmptyState />;
  }

  return (
    <ClipList
      clips={clips}
      loadMoreRef={ref}
      isFetchingNextPage={isFetchingNextPage}
      onCopy={onCopy}
      onToggleFavorite={onToggleFavorite}
      onContextMenu={onContextMenu}
      isDeleteMode={isDeleteMode}
      isInteractionDisabled={isInteractionDisabled}
      selectedClipIds={selectedClipIds}
      onToggleSelected={onToggleSelected}
    />
  );
}
