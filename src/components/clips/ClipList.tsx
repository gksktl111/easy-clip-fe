"use client";

import { Clip } from "../../types/clip";
import { ClipItem } from "./ClipItem";

interface ClipListProps {
  clips: Clip[];
}

export function ClipList({ clips }: ClipListProps) {
  if (clips.length === 0) return null;

  return (
    <div className="flex-1 overflow-auto px-6 py-4">
      <div className="grid grid-cols-1 gap-3">
        {clips.map((clip) => (
          <ClipItem key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
}
