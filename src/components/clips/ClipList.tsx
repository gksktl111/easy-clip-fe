"use client";

import { Clip } from "../../types/clip";
import { ClipItem } from "./ClipItem";

interface ClipListProps {
  clips: Clip[];
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => void;
}

export function ClipList({
  clips,
  onCopy,
  onToggleFavorite,
  onContextMenu,
}: ClipListProps) {
  if (clips.length === 0) return null;

  return (
    <div className="flex-1 overflow-auto px-6 py-4">
      <div className="grid grid-cols-1 gap-4 min-[401px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1200px]:grid-cols-5">
        {clips.map((clip) => (
          <ClipItem
            key={clip.id}
            clip={clip}
            onCopy={onCopy}
            onToggleFavorite={onToggleFavorite}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  );
}
