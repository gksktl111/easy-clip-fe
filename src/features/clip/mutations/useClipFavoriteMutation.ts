"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeClip, unlikeClip } from "@/features/clip/api/clipApi";
import type { Clip } from "@/features/clip/model/clip";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

interface UseClipFavoriteMutationOptions {
  isAuthenticated: boolean;
}

interface ToggleFavoriteVariables {
  clipId: string;
  isFavorite: boolean;
}

// 즐겨찾기 요청과 완료 후 목록 갱신을 관리합니다.
export const useClipFavoriteMutation = ({
  isAuthenticated,
}: UseClipFavoriteMutationOptions) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ clipId, isFavorite }: ToggleFavoriteVariables) =>
      isFavorite ? likeClip(clipId) : unlikeClip(clipId),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
  });
  const { isPending, mutateAsync } = mutation;

  const toggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!isAuthenticated || isPending) {
        return;
      }

      try {
        await mutateAsync({
          clipId: clip.id,
          isFavorite: !clip.isFavorite,
        });
      } catch {
      // 요청 실패 시 목록은 기존 query 결과를 유지합니다.
      }
    },
    [isAuthenticated, isPending, mutateAsync],
  );

  return {
    isPending,
    pendingClipId: isPending ? mutation.variables?.clipId ?? null : null,
    toggleFavorite,
  };
};
