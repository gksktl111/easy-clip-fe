"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ClipList } from "../../../components/clips/ClipList";
import { DeleteAllButton } from "../../../components/clips/DeleteAllButton";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import { Clip } from "../../../types/clip";

interface StoredClip extends Omit<Clip, "createdAt"> {
  createdAt: string;
}

const CLIP_STORAGE_KEY = "easy-clip-folder-clips";
const CLIP_EVENT = "clips:change";
const EMPTY_CLIPS: StoredClip[] = [];

export default function FavoritesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const lastClipsRawRef = useRef<string | null>(null);
  const lastClipsRef = useRef<StoredClip[]>(EMPTY_CLIPS);

  const getFavoritesSnapshot = useCallback(() => {
    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (stored === lastClipsRawRef.current) {
      return lastClipsRef.current;
    }
    let nextClips = EMPTY_CLIPS;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, StoredClip[]>;
        const allClips = Object.values(parsed ?? {}).flat();
        nextClips = allClips.filter((clip) => clip.isFavorite);
      } catch {
        nextClips = EMPTY_CLIPS;
      }
    }
    lastClipsRawRef.current = stored;
    lastClipsRef.current = nextClips;
    return nextClips;
  }, []);

  const subscribeToClips = useCallback((callback: () => void) => {
    const handler = () => callback();
    window.addEventListener("storage", handler);
    window.addEventListener(CLIP_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CLIP_EVENT, handler);
    };
  }, []);

  const storedClips = useSyncExternalStore(
    subscribeToClips,
    getFavoritesSnapshot,
    () => EMPTY_CLIPS,
  );

  const favoriteClips = useMemo(
    () =>
      storedClips.map((clip) => ({
        ...clip,
        createdAt: new Date(clip.createdAt),
      })),
    [storedClips],
  );

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
