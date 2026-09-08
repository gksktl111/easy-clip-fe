"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeClip, unlikeClip } from "@/features/clip/api/clipApi";
import type { Clip } from "@/features/clip/model/clip";
import {
  optimisticallyUpdateClipFavorite,
  restoreClipFavorite,
} from "@/features/clip/service/clipFavoriteQueryCache";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

interface UseClipFavoriteMutationOptions {
  isAuthenticated: boolean;
  onError?: () => void;
}

interface ToggleFavoriteVariables {
  clipId: string;
  isFavorite: boolean;
}

// 즐겨찾기 요청과 완료 후 목록 갱신을 관리합니다.
export const useClipFavoriteMutation = ({
  isAuthenticated,
  onError,
}: UseClipFavoriteMutationOptions) => {
  const access = useResourceAccess();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ clipId, isFavorite }: ToggleFavoriteVariables) =>
      isFavorite ? likeClip(clipId) : unlikeClip(clipId),
    onMutate: async ({ clipId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: clipQueryKeys.all });
      return optimisticallyUpdateClipFavorite(queryClient, clipId, isFavorite);
    },
    onError: (_error, { clipId }, snapshot) => {
      if (snapshot) restoreClipFavorite(queryClient, clipId, snapshot);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
  });
  const { isPending, mutateAsync } = mutation;

  const toggleFavorite = useCallback(
    async (clip: Clip) => {
      if (
        !isAuthenticated ||
        isPending ||
        access.status !== "ready" ||
        !clip.folderId ||
        access.folderLocks[clip.folderId] !== false
      ) {
        return;
      }

      try {
        await mutateAsync({
          clipId: clip.id,
          isFavorite: !clip.isFavorite,
        });
      } catch {
        onError?.();
      }
    },
    [isAuthenticated, isPending, mutateAsync, onError, access],
  );

  return {
    isPending,
    pendingClipId: isPending ? (mutation.variables?.clipId ?? null) : null,
    toggleFavorite,
  };
};
