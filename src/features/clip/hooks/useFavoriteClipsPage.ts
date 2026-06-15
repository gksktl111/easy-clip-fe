"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
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

export const useFavoriteClipsPage = () => {
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [clips, setClips] = useState<Clip[]>([]);
  const { copyToast, showCopyToast } = useCopyToast();

  const loadFavoriteClips = useCallback(async () => {
    if (!accessToken) {
      startTransition(() => {
        setClips([]);
      });
      return;
    }

    const response = await fetchClips(accessToken, {
      favorite: true,
    });

    startTransition(() => {
      setClips(response.map(mapClipResponse));
    });
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
    setActiveFilter,
    handleCopy,
    handleToggleFavorite,
  };
};
