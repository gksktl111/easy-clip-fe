"use client";

import { useState } from "react";
import { ClipList } from "../../../components/clips/ClipList";
import { DeleteAllButton } from "../../../components/clips/DeleteAllButton";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import { Clip } from "../../../types/clip";

export default function FavoritesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // 예시: 즐겨찾기는 아직 비어있음
  const favoriteClips: Clip[] = [];
  const filteredClips = favoriteClips.filter(
    (clip) => activeFilter === "all" || clip.type === activeFilter,
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      {filteredClips.length ? (
        <ClipList clips={filteredClips} />
      ) : (
        <EmptyState />
      )}
      <DeleteAllButton disabled />
    </div>
  );
}
