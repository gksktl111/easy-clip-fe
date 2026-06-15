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
  likeClip,
  recordClipView,
  unlikeClip,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { Clip } from "@/features/clip/model/clip";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { FilterType } from "@/features/clip/ui/FilterBar";
import { waitForMinimumLoading } from "@/shared/lib/loading";

export const useFavoriteClipsPage = () => {
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [clips, setClips] = useState<Clip[]>([]);
  const { copyToast, showCopyToast } = useCopyToast();
  const requestSerialRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const loadFavoriteClips = useCallback(async () => {
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
        favorite: true,
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
    void loadFavoriteClips();
  }, [loadFavoriteClips]);

  const filteredClips = useMemo(
    () =>
      clips.filter(
        (clip) => activeFilter === "all" || clip.type === activeFilter,
      ),
    [activeFilter, clips],
  );

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
      }
    },
    [accessToken, showCopyToast],
  );

  const handleToggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!accessToken) {
        return;
      }

      if (clip.isFavorite) {
        await unlikeClip(accessToken, clip.id);
      } else {
        await likeClip(accessToken, clip.id);
      }

      await loadFavoriteClips();
    },
    [accessToken, loadFavoriteClips],
  );

  return {
    activeFilter,
    copyToast,
    filteredClips,
    isLoading,
    setActiveFilter,
    handleCopy,
    handleToggleFavorite,
  };
};
