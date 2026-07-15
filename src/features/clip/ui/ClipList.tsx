"use client";

import { ClipItem } from "@/features/clip/ui/ClipItem";
import type { Clip } from "@/features/clip/model/clip";

const EMPTY_SELECTED_CLIP_IDS = new Set<string>();

// 클립 카드를 반응형 그리드로 렌더링하고 무한 스크롤 감지 영역을 제공합니다.
interface ClipListProps {
  clips: Clip[];
  loadMoreRef?: React.Ref<HTMLDivElement>;
  isFetchingNextPage?: boolean;
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

export function ClipList({
  clips,
  loadMoreRef,
  isFetchingNextPage = false,
  onCopy,
  onToggleFavorite,
  onContextMenu,
  isDeleteMode = false,
  isInteractionDisabled = false,
  selectedClipIds = EMPTY_SELECTED_CLIP_IDS,
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
