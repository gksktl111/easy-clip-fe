"use client";

import { Clip } from "@/features/clip/model/clip";
import { ClipList } from "@/features/clip/ui/ClipList";
import { ClipListSkeleton } from "@/features/clip/ui/ClipListSkeleton";
import { EmptyState } from "@/features/clip/ui/EmptyState";

interface ClipResultsSectionProps {
  clips: Clip[];
  isLoading?: boolean;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => void;
}

export function ClipResultsSection({
  clips,
  isLoading = false,
  onCopy,
  onToggleFavorite,
  onContextMenu,
}: ClipResultsSectionProps) {
  if (isLoading) {
    return <ClipListSkeleton />;
  }

  if (!clips.length) {
    return <EmptyState />;
  }

  return (
    <ClipList
      clips={clips}
      onCopy={onCopy}
      onToggleFavorite={onToggleFavorite}
      onContextMenu={onContextMenu}
    />
  );
}
