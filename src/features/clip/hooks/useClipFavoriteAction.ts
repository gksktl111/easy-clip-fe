"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { likeClip, unlikeClip } from "@/features/clip/api/clipApi";
import type { Clip } from "@/features/clip/model/clip";
import {
  invalidateClipQueries,
  updateClipFavoriteCache,
} from "@/features/clip/service/clipQueryCache";

interface UseClipFavoriteActionOptions {
  isAuthenticated: boolean;
  isDisabled?: boolean;
}

// 즐겨찾기 상태를 optimistic update하고 요청 실패 시 이전 캐시로 복구합니다.
export const useClipFavoriteAction = ({
  isAuthenticated,
  isDisabled = false,
}: UseClipFavoriteActionOptions) => {
  const queryClient = useQueryClient();

  const toggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!isAuthenticated || isDisabled) {
        return;
      }

      const nextFavorite = !clip.isFavorite;
      const rollbackFavorite = updateClipFavoriteCache(
        queryClient,
        clip.id,
        nextFavorite,
      );

      try {
        if (nextFavorite) {
          await likeClip(clip.id);
        } else {
          await unlikeClip(clip.id);
        }
      } catch {
        rollbackFavorite();
      } finally {
        void invalidateClipQueries(queryClient);
      }
    },
    [isAuthenticated, isDisabled, queryClient],
  );

  return { toggleFavorite };
};
