"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ClipList } from "../../../components/clips/ClipList";
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
  const [copyToast, setCopyToast] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const copyToastTimerRef = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
    };
  }, []);

  const updateClipFavorite = useCallback((clipId: string, isFavorite: boolean) => {
    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (!stored) return;
    let nextMap: Record<string, StoredClip[]> = {};
    try {
      nextMap = JSON.parse(stored) as Record<string, StoredClip[]>;
    } catch {
      nextMap = {};
    }
    Object.keys(nextMap).forEach((folderId) => {
      nextMap[folderId] = (nextMap[folderId] ?? []).map((clip) =>
        clip.id === clipId ? { ...clip, isFavorite } : clip,
      );
    });
    localStorage.setItem(CLIP_STORAGE_KEY, JSON.stringify(nextMap));
    window.dispatchEvent(new Event(CLIP_EVENT));
  }, []);


  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, clientY } = event;
      setCopyToast({ x: clientX, y: clientY });
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
      copyToastTimerRef.current = window.setTimeout(() => {
        setCopyToast(null);
      }, 3000);
      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }
    },
    [],
  );

  const handleToggleFavorite = useCallback(
    (clip: Clip) => {
      updateClipFavorite(clip.id, !clip.isFavorite);
    },
    [updateClipFavorite],
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showStatus={false}
      />
      {filteredClips.length ? (
        <ClipList
          clips={filteredClips}
          onCopy={handleCopy}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <EmptyState />
      )}

      {copyToast ? (
        <div
          className="fixed z-50 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md"
          style={{ left: copyToast.x + 12, top: copyToast.y + 12 }}
        >
          COPY!
        </div>
      ) : null}
    </div>
  );
}
