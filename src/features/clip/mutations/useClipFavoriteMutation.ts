"use client";

import { notifyError, notifySuccess } from "@/shared/feedback/toast";

import { useTranslations } from "next-intl";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { useCallback, useRef } from "react";
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
}

interface ToggleFavoriteVariables {
  clipId: string;
  isFavorite: boolean;
}

// 즐겨찾기 요청과 완료 후 목록 갱신을 관리합니다.
export const useClipFavoriteMutation = ({
  isAuthenticated,
}: UseClipFavoriteMutationOptions) => {
  const t = useTranslations("feedback");
  const pending = useRef(false);
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
      queryClient
        .invalidateQueries({ queryKey: clipQueryKeys.all })
        .catch(() => undefined),
  });
  const { isPending, mutateAsync } = mutation;

  const toggleFavorite = useCallback(
    async (clip: Clip) => {
      if (
        !isAuthenticated ||
        isPending ||
        pending.current ||
        access.status !== "ready" ||
        !clip.folderId ||
        access.folderLocks[clip.folderId] !== false
      ) {
        return;
      }

      pending.current = true;
      try {
        await mutateAsync({
          clipId: clip.id,
          isFavorite: !clip.isFavorite,
        });
        notifySuccess(
          t(clip.isFavorite ? "favoriteRemoved" : "favoriteAdded"),
          undefined,
          "clip-favorite",
        );
      } catch {
        notifyError(t("favoriteError"), undefined, "clip-favorite");
      } finally {
        pending.current = false;
      }
    },
    [isAuthenticated, isPending, mutateAsync, t, access],
  );

  return {
    isPending,
    pendingClipId: isPending ? (mutation.variables?.clipId ?? null) : null,
    toggleFavorite,
  };
};
