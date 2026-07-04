"use client";

import { ClipItem } from "@/features/clip/ui/ClipItem";
import { Clip } from "@/features/clip/model/clip";

interface ClipListProps {
  clips: Clip[];
  loadMoreRef?: React.Ref<HTMLDivElement>;
  isFetchingNextPage?: boolean;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => void;
  isDeleteMode?: boolean;
  isInteractionDisabled?: boolean;
  selectedClipIds?: Set<string>;
  onToggleSelected?: (clipId: string) => void;
}

export function ClipList({
  clips,
  loadMoreRef,
  isFetchingNextPage = false,
  onCopy,
  onToggleFavorite,
  onContextMenu,
  isDeleteMode = false,
  isInteractionDisabled = false,
  selectedClipIds = new Set(),
  onToggleSelected,
}: ClipListProps) {
  if (clips.length === 0) {
    return null;
  }

  return (
    <div className="clip-scrollbar flex-1 overflow-auto px-4 py-4 md:px-6">
      <div className="grid grid-cols-1 gap-4 min-[800px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1440px]:grid-cols-4">
        {clips.map((clip) => (
          <ClipItem
            key={clip.id}
            clip={clip}
            onCopy={onCopy}
            onToggleFavorite={onToggleFavorite}
            onContextMenu={onContextMenu}
            isDeleteMode={isDeleteMode}
            isInteractionDisabled={isInteractionDisabled}
            isSelected={selectedClipIds.has(clip.id)}
            onToggleSelected={onToggleSelected}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="h-8" aria-hidden />
      {isFetchingNextPage ? (
        <div className="flex justify-center pb-6">
          <div className="skeleton-shimmer h-2 w-24 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}
