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
import { DeleteAllButton } from "../../../components/clips/DeleteAllButton";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import {
  clearRecentClips,
  CLIP_EVENT,
  CLIP_STORAGE_KEY,
  getRecentClips,
  recordCopy,
  StoredClip,
} from "../../../store/clipStore";
import { Clip } from "../../../types/clip";

const EMPTY_RECENTS: StoredClip[] = [];

export default function RecentPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copyToast, setCopyToast] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const copyToastTimerRef = useRef<number | null>(null);
  const lastRawRef = useRef<string | null>(null);
  const lastClipsRef = useRef<StoredClip[]>(EMPTY_RECENTS);

  const getRecentSnapshot = useCallback(() => {
    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (stored !== null && stored === lastRawRef.current) {
      return lastClipsRef.current;
    }
    const next = getRecentClips();
    lastRawRef.current = stored;
    lastClipsRef.current = next;
    return next;
  }, []);

  const subscribeToRecents = useCallback((callback: () => void) => {
    const handler = () => callback();
    window.addEventListener("storage", handler);
    window.addEventListener(CLIP_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CLIP_EVENT, handler);
    };
  }, []);

  const storedClips = useSyncExternalStore(
    subscribeToRecents,
    getRecentSnapshot,
    () => EMPTY_RECENTS,
  );

  const recentClips = useMemo<Clip[]>(
    () =>
      storedClips.map((clip) => ({
        ...clip,
        createdAt: new Date(clip.createdAt),
        updatedAt: clip.updatedAt ? new Date(clip.updatedAt) : undefined,
        lastCopiedAt: clip.lastCopiedAt ? new Date(clip.lastCopiedAt) : null,
      })),
    [storedClips],
  );

  const filteredClips = useMemo(() => {
    const byType =
      activeFilter === "all"
        ? recentClips
        : recentClips.filter((clip) => clip.type === activeFilter);
    if (!searchQuery.trim()) return byType;
    const lowered = searchQuery.toLowerCase();
    return byType.filter((clip) => clip.name.toLowerCase().includes(lowered));
  }, [activeFilter, recentClips, searchQuery]);

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

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showStatus={false}
        countLabel={`${filteredClips.length} clips`}
      />
      {filteredClips.length ? (
        <ClipList clips={filteredClips} onCopy={handleCopy} />
      ) : (
        <EmptyState />
      )}
      <DeleteAllButton
        disabled={storedClips.length === 0}
        onClick={() => clearRecentClips()}
      />

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
