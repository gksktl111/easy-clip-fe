"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { subscribeToClipStore } from "@/features/clip/service/clipStoreSubscription";
import { mapStoredClipDates } from "@/features/clip/service/mapStoredClipDates";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import {
  clearRecentClips,
  CLIP_STORAGE_KEY,
  getRecentClips,
  recordCopy,
  StoredClip,
} from "@/features/clip/service/clipStorage";
import { FilterType } from "@/features/clip/ui/FilterBar";
import { Clip } from "@/features/clip/model/clip";

const EMPTY_RECENTS: StoredClip[] = [];

export const useRecentClipsPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { copyToast, showCopyToast } = useCopyToast();
  const lastRawRef = useRef<string | null>(null);
  const lastClipsRef = useRef<StoredClip[]>(EMPTY_RECENTS);

  const getRecentSnapshot = useCallback(() => {
    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (stored === lastRawRef.current) {
      return lastClipsRef.current;
    }

    const nextClips = getRecentClips();
    lastRawRef.current = stored;
    lastClipsRef.current = nextClips;
    return nextClips;
  }, []);

  const storedClips = useSyncExternalStore(
    subscribeToClipStore,
    getRecentSnapshot,
    () => EMPTY_RECENTS,
  );

  const recentClips = useMemo<Clip[]>(
    () => storedClips.map(mapStoredClipDates),
    [storedClips],
  );

  const filteredClips = useMemo(() => {
    const clipsByType =
      activeFilter === "all"
        ? recentClips
        : recentClips.filter((clip) => clip.type === activeFilter);

    if (!searchQuery.trim()) {
      return clipsByType;
    }

    const loweredQuery = searchQuery.toLowerCase();
    return clipsByType.filter((clip) =>
      clip.name.toLowerCase().includes(loweredQuery),
    );
  }, [activeFilter, recentClips, searchQuery]);

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      showCopyToast(event.clientX, event.clientY);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      recordCopy(clip.id);
    },
    [showCopyToast],
  );

  return {
    activeFilter,
    copyToast,
    filteredClips,
    searchQuery,
    hasClips: storedClips.length > 0,
    setActiveFilter,
    setSearchQuery,
    clearAll: clearRecentClips,
    handleCopy,
  };
};
