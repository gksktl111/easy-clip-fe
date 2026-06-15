"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  fetchClips,
  recordClipView,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { Clip } from "@/features/clip/model/clip";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { FilterType } from "@/features/clip/ui/FilterBar";
import { waitForMinimumLoading } from "@/shared/lib/loading";

export const useRecentClipsPage = () => {
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [clips, setClips] = useState<Clip[]>([]);
  const { copyToast, showCopyToast } = useCopyToast();
  const requestSerialRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const loadRecentClips = useCallback(async () => {
    const requestId = requestSerialRef.current + 1;
    requestSerialRef.current = requestId;
    const shouldShowSkeleton = !hasLoadedOnceRef.current;
    const loadingStartedAt = Date.now();

    if (!accessToken) {
      if (shouldShowSkeleton) {
        await waitForMinimumLoading(loadingStartedAt);
      }

      if (requestId !== requestSerialRef.current) {
        return;
      }

      startTransition(() => {
        setClips([]);
        hasLoadedOnceRef.current = true;
        setIsLoading(false);
      });
      return;
    }

    if (shouldShowSkeleton) {
      setIsLoading(true);
    }

    try {
      const response = await fetchClips(accessToken, {
        recent: true,
      });

      if (requestId !== requestSerialRef.current) {
        return;
      }

      startTransition(() => {
        setClips(response.map(mapClipResponse));
        hasLoadedOnceRef.current = true;
      });
    } finally {
      if (shouldShowSkeleton) {
        await waitForMinimumLoading(loadingStartedAt);
      }
      if (requestId === requestSerialRef.current) {
        setIsLoading(false);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    hasLoadedOnceRef.current = false;
    setIsLoading(true);
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
    isLoading,
    searchQuery,
    hasClips: clips.length > 0,
    setActiveFilter,
    setSearchQuery,
    clearAll: () => undefined,
    handleCopy,
  };
};
