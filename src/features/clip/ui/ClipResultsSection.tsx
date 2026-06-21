"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Clip } from "@/features/clip/model/clip";
import { ClipList } from "@/features/clip/ui/ClipList";
import { ClipListSkeleton } from "@/features/clip/ui/ClipListSkeleton";
import { EmptyState } from "@/features/clip/ui/EmptyState";

interface ClipResultsSectionProps {
  clips: Clip[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => void;
}

export function ClipResultsSection({
  clips,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
  onCopy,
  onToggleFavorite,
  onContextMenu,
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
    />
  );
}
