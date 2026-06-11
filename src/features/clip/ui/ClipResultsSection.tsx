"use client";

import { Clip } from "@/features/clip/model/clip";
import { ClipList } from "@/features/clip/ui/ClipList";
import { EmptyState } from "@/features/clip/ui/EmptyState";

interface ClipResultsSectionProps {
  clips: Clip[];
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => void;
}

export function ClipResultsSection({
  clips,
  onCopy,
  onToggleFavorite,
  onContextMenu,
}: ClipResultsSectionProps) {
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
