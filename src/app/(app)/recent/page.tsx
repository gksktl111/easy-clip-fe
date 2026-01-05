"use client";

import { useMemo, useState } from "react";
import { ClipList } from "../../../components/clips/ClipList";
import { DeleteAllButton } from "../../../components/clips/DeleteAllButton";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import { Clip } from "../../../types/clip";

export default function RecentPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [clips] = useState<Clip[]>(() => {
    const now = Date.now();
    return [
      {
        id: "1",
        type: "text",
        content: "Hello, Clipboard Studio!",
        createdAt: new Date(now),
        isFavorite: false,
      },
      {
        id: "2",
        type: "color",
        content: "#0EA5E9",
        createdAt: new Date(now - 1000 * 60 * 20),
        isFavorite: true,
      },
      {
        id: "3",
        type: "image",
        content: "Screenshot_2024.png",
        createdAt: new Date(now - 1000 * 60 * 60),
        isFavorite: false,
      },
    ];
  });

  const filteredClips = useMemo(() => {
    if (activeFilter === "all") return clips;
    return clips.filter((clip) => clip.type === activeFilter);
  }, [activeFilter, clips]);

  const hasClips = filteredClips.length > 0;

  return (
    <div className="flex h-full flex-col bg-white">
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      {hasClips ? <ClipList clips={filteredClips} /> : <EmptyState />}
      <DeleteAllButton disabled={!hasClips} />
    </div>
  );
}
