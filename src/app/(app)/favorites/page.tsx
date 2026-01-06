"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ClipList } from "../../../components/clips/ClipList";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import {
  CLIP_EVENT,
  CLIP_STORAGE_KEY,
  getFavoriteClips,
  recordCopy,
  StoredClip,
  updateClip,
} from "../../../store/clipStore";
import { Clip } from "../../../types/clip";

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
    if (stored !== null && stored === lastClipsRawRef.current) {
      return lastClipsRef.current;
    }
    const nextClips = getFavoriteClips();
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

  const filteredClips = useMemo<Clip[]>(
    () =>
      favoriteClips
        .map((clip) => ({
          ...clip,
          createdAt: new Date(clip.createdAt),
          updatedAt: clip.updatedAt ? new Date(clip.updatedAt) : undefined,
          lastCopiedAt: clip.lastCopiedAt ? new Date(clip.lastCopiedAt) : null,
        }))
        .filter((clip) => activeFilter === "all" || clip.type === activeFilter),
    [activeFilter, favoriteClips],
  );

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
    };
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
      recordCopy(clip.id);
    },
    [],
  );

  const handleToggleFavorite = useCallback((clip: Clip) => {
    updateClip(clip.id, {
      isFavorite: !clip.isFavorite,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showStatus={false}
        countLabel={`${filteredClips.length} clips`}
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
