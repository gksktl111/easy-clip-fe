"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  removeAllClipsInFolder,
  removeClip,
  removeClips,
} from "@/features/clip/api/clipApi";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

interface UseClipDeletionMutationOptions {
  folderId: string;
  isAuthenticated: boolean;
  onDeleted?: () => void | Promise<void>;
}

interface DeleteClipsVariables {
  clipIds: string[];
  kind: "single" | "multiple";
}

export type DeleteAllClipsResult = number | null;

const getUniqueClipIds = (clipIds: string[]) => [...new Set(clipIds)];

// 단건·다건·현재 폴더 전체 삭제 요청과 완료 후 목록 갱신을 관리합니다.
export const useClipDeletionMutation = ({
  folderId,
  isAuthenticated,
  onDeleted,
}: UseClipDeletionMutationOptions) => {
  const queryClient = useQueryClient();
  const pending = useRef(false);
  const deleteMutation = useMutation({
    mutationFn: async ({ clipIds, kind }: DeleteClipsVariables) => {
      if (kind === "single") {
        await removeClip(clipIds[0] ?? "");
        return 1;
      }

      return (await removeClips({ clipIds })).deletedCount;
    },
    onSuccess: () => {
      void Promise.resolve()
        .then(() => onDeleted?.())
        .catch(() => undefined);
    },
    onSettled: () =>
      queryClient
        .invalidateQueries({ queryKey: clipQueryKeys.all })
        .catch(() => undefined),
  });
  const deleteAllMutation = useMutation({
    mutationFn: (targetFolderId: string) =>
      removeAllClipsInFolder(targetFolderId),
    onSuccess: () => {
      void Promise.resolve()
        .then(() => onDeleted?.())
        .catch(() => undefined);
    },
    onSettled: () =>
      queryClient
        .invalidateQueries({ queryKey: clipQueryKeys.all })
        .catch(() => undefined),
  });
  const isDeleting = deleteMutation.isPending || deleteAllMutation.isPending;
  const { mutateAsync: deleteMutateAsync } = deleteMutation;
  const { mutateAsync: deleteAllMutateAsync } = deleteAllMutation;

  const deleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated || isDeleting || pending.current) {
        return null;
      }

      pending.current = true;
      try {
        return await deleteMutateAsync({ clipIds: [clipId], kind: "single" });
      } finally {
        pending.current = false;
      }
    },
    [deleteMutateAsync, isAuthenticated, isDeleting],
  );

  const deleteClips = useCallback(
    async (clipIds: string[]) => {
      if (!isAuthenticated || isDeleting || pending.current) {
        return null;
      }

      const uniqueClipIds = getUniqueClipIds(clipIds);
      if (uniqueClipIds.length === 0) {
        return null;
      }

      pending.current = true;
      try {
        return await deleteMutateAsync({
          clipIds: uniqueClipIds,
          kind: "multiple",
        });
      } finally {
        pending.current = false;
      }
    },
    [deleteMutateAsync, isAuthenticated, isDeleting],
  );

  const deleteAll = useCallback(async (): Promise<DeleteAllClipsResult> => {
    if (!isAuthenticated || !folderId || isDeleting || pending.current) {
      return null;
    }

    pending.current = true;
    try {
      return (await deleteAllMutateAsync(folderId)).deletedCount;
    } finally {
      pending.current = false;
    }
  }, [deleteAllMutateAsync, folderId, isAuthenticated, isDeleting]);

  return {
    deleteAll,
    deleteClip,
    deleteClips,
    isDeleting,
  };
};
