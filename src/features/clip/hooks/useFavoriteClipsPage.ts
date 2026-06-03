"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { subscribeToClipStore } from "@/features/clip/service/clipStoreSubscription";
import { Clip } from "@/features/clip/model/clip";
import {
  CLIP_STORAGE_KEY,
  getFavoriteClips,
  recordCopy,
  StoredClip,
  updateClip,
} from "@/features/clip/service/clipStorage";
import { mapStoredClipDates } from "@/features/clip/service/mapStoredClipDates";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { FilterType } from "@/features/clip/ui/FilterBar";

const EMPTY_CLIPS: StoredClip[] = [];

export const useFavoriteClipsPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { copyToast, showCopyToast } = useCopyToast();
  const lastRawRef = useRef<string | null>(null);
  const lastClipsRef = useRef<StoredClip[]>(EMPTY_CLIPS);

  const getFavoritesSnapshot = useCallback(() => {
    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (stored === lastRawRef.current) {
      return lastClipsRef.current;
    }

    const nextClips = getFavoriteClips();
    lastRawRef.current = stored;
    lastClipsRef.current = nextClips;
    return nextClips;
  }, []);

  const storedClips = useSyncExternalStore(
    subscribeToClipStore,
    getFavoritesSnapshot,
    () => EMPTY_CLIPS,
  );

  const filteredClips = useMemo(
    () =>
      storedClips
        .map(mapStoredClipDates)
        .filter((clip) => activeFilter === "all" || clip.type === activeFilter),
    [activeFilter, storedClips],
  );

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

  const handleToggleFavorite = useCallback((clip: Clip) => {
    updateClip(clip.id, {
      isFavorite: !clip.isFavorite,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return {
    activeFilter,
    copyToast,
    filteredClips,
    setActiveFilter,
    handleCopy,
    handleToggleFavorite,
  };
};
