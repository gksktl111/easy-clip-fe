"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  fetchClips,
  recordClipView,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { Clip } from "@/features/clip/model/clip";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { FilterType } from "@/features/clip/ui/FilterBar";

export const useRecentClipsPage = () => {
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clips, setClips] = useState<Clip[]>([]);
  const { copyToast, showCopyToast } = useCopyToast();

  const loadRecentClips = useCallback(async () => {
    if (!accessToken) {
      startTransition(() => {
        setClips([]);
      });
      return;
    }

    const response = await fetchClips(accessToken, {
      recent: true,
    });

    startTransition(() => {
      setClips(response.map(mapClipResponse));
    });
  }, [accessToken]);

  useEffect(() => {
    void loadRecentClips();
  }, [loadRecentClips]);

  const filteredClips = useMemo(() => {
    const clipsByType =
      activeFilter === "all"
        ? clips
        : clips.filter((clip) => clip.type === activeFilter);

    if (!searchQuery.trim()) {
      return clipsByType;
    }

    const loweredQuery = searchQuery.toLowerCase();
    return clipsByType.filter((clip) =>
      clip.name.toLowerCase().includes(loweredQuery),
    );
  }, [activeFilter, clips, searchQuery]);

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      showCopyToast(event.clientX, event.clientY);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      if (accessToken) {
        await recordClipView(accessToken, clip.id);
        await loadRecentClips();
      }
    },
    [accessToken, loadRecentClips, showCopyToast],
  );

  return {
    activeFilter,
    copyToast,
    filteredClips,
    searchQuery,
    hasClips: false,
    setActiveFilter,
    setSearchQuery,
    clearAll: () => undefined,
    handleCopy,
  };
};
