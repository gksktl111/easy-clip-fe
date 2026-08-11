"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClips,
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

export type DeleteAllClipsResult = "deleted" | "empty" | "ignored";

const getUniqueClipIds = (clipIds: string[]) => [...new Set(clipIds)];

// 단건·다건 삭제 요청과 완료 후 목록 갱신을 관리합니다.
export const useClipDeletionMutation = ({
  folderId,
  isAuthenticated,
  onDeleted,
}: UseClipDeletionMutationOptions) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({ clipIds, kind }: DeleteClipsVariables) => {
      if (kind === "single") {
        await removeClip(clipIds[0] ?? "");
        return;
      }

      await removeClips({ clipIds });
    },
    onSuccess: () => {
      void onDeleted?.();
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
  });
  const fetchAllFolderClipIdsMutation = useMutation({
    mutationFn: async () => {
      const clipIds: string[] = [];
      let cursor: string | null = null;

      do {
        const response = await fetchClips({
          folderId,
          type: "ALL",
          cursor,
        });

        clipIds.push(...response.items.map((clip) => clip.id));
        cursor = response.hasMore ? response.nextCursor : null;
      } while (cursor);

      return getUniqueClipIds(clipIds);
    },
  });
  const isDeleting =
    deleteMutation.isPending || fetchAllFolderClipIdsMutation.isPending;
  const { mutateAsync: deleteMutateAsync } = deleteMutation;
  const { mutateAsync: fetchAllFolderClipIds } = fetchAllFolderClipIdsMutation;

  const deleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated || isDeleting) {
        return false;
      }

      await deleteMutateAsync({ clipIds: [clipId], kind: "single" });
      return true;
    },
    [deleteMutateAsync, isAuthenticated, isDeleting],
  );

  const deleteClips = useCallback(
    async (clipIds: string[]) => {
      if (!isAuthenticated || isDeleting) {
        return false;
      }

      const uniqueClipIds = getUniqueClipIds(clipIds);
      if (uniqueClipIds.length === 0) {
        return false;
      }

      await deleteMutateAsync({
        clipIds: uniqueClipIds,
        kind: "multiple",
      });
      return true;
    },
    [deleteMutateAsync, isAuthenticated, isDeleting],
  );

  const deleteAll = useCallback(async (): Promise<DeleteAllClipsResult> => {
    if (!isAuthenticated || !folderId || isDeleting) {
      return "ignored";
    }

    const clipIds = await fetchAllFolderClipIds();
    if (clipIds.length === 0) {
      return "empty";
    }

    await deleteMutateAsync({ clipIds, kind: "multiple" });
    return "deleted";
  }, [
    deleteMutateAsync,
    fetchAllFolderClipIds,
    folderId,
    isAuthenticated,
    isDeleting,
  ]);

  return {
    deleteAll,
    deleteClip,
    deleteClips,
    isDeleting,
  };
};
