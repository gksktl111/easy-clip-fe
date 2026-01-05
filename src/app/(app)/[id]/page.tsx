"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ClipList } from "../../../components/clips/ClipList";
import { DeleteAllButton } from "../../../components/clips/DeleteAllButton";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import { Clip } from "../../../types/clip";

export default function FolderPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const params = useParams<{ id?: string }>();
  const folderId = params?.id ?? "";

  // 예시: 폴더별 클립 데이터는 추후 연결
  const folderClips: Clip[] = [];
  const filteredClips = folderClips.filter(
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
