"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchClips,
  removeClip,
  removeClips,
} from "@/features/clip/api/clipApi";
import type { Clip } from "@/features/clip/model/clip";
import {
  cancelClipQueries,
  invalidateClipQueries,
  removeClipsFromCache,
} from "@/features/clip/service/clipQueryCache";
import { notifyError } from "@/shared/feedback/toast";

interface UseClipDeletionOptions {
  clips: Clip[];
  folderId: string;
  isAuthenticated: boolean;
  onDeleted?: () => void | Promise<void>;
}

// 클립 삭제 모드, 선택 상태, 확인 모달과 단건·선택·전체 삭제 흐름을 관리합니다.
export const useClipDeletion = ({
  clips,
  folderId,
  isAuthenticated,
  onDeleted,
}: UseClipDeletionOptions) => {
  const queryClient = useQueryClient();
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const availableClipIds = new Set(clips.map((clip) => clip.id));

    setSelectedClipIds((currentIds) => {
      const nextIds = new Set(
        [...currentIds].filter((clipId) => availableClipIds.has(clipId)),
      );

      return nextIds.size === currentIds.size ? currentIds : nextIds;
    });
  }, [clips]);

  const closeDeleteAllModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteAllOpen(false);
    }
  }, [isDeleting]);
  const openDeleteAllModal = useCallback(() => setIsDeleteAllOpen(true), []);

  const enterDeleteMode = useCallback(() => {
    if (!isAuthenticated || clips.length === 0 || isDeleting) {
      return;
    }

    setIsDeleteMode(true);
    setSelectedClipIds(new Set());
  }, [clips.length, isAuthenticated, isDeleting]);

  const cancelDeleteMode = useCallback(() => {
    if (isDeleting) {
      return;
    }

    setIsDeleteMode(false);
    setSelectedClipIds(new Set());
  }, [isDeleting]);

  const toggleClipSelected = useCallback(
    (clipId: string) => {
      if (!isDeleteMode || isDeleting) {
        return;
      }

      setSelectedClipIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(clipId)) {
          nextIds.delete(clipId);
        } else {
          nextIds.add(clipId);
        }

        return nextIds;
      });
    },
    [isDeleteMode, isDeleting],
  );

  const deleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated || isDeleting) {
        return;
      }

      setIsDeleting(true);
      await cancelClipQueries(queryClient);
      const rollbackDeletedClip = removeClipsFromCache(queryClient, [clipId]);
      let isDeleted = false;

      try {
        await removeClip(clipId);
        isDeleted = true;
      } catch {
        rollbackDeletedClip();
        notifyError("클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsDeleting(false);
        void invalidateClipQueries(queryClient);
        if (isDeleted) {
          void onDeleted?.();
        }
      }
    },
    [isAuthenticated, isDeleting, onDeleted, queryClient],
  );

  const deleteClipsByIds = useCallback(
    async (clipIds: string[], errorMessage: string) => {
      if (!isAuthenticated || isDeleting) {
        return false;
      }

      const uniqueClipIds = [...new Set(clipIds)];
      if (uniqueClipIds.length === 0) {
        return false;
      }

      setIsDeleting(true);
      await cancelClipQueries(queryClient);
      const rollbackDeletedClips = removeClipsFromCache(
        queryClient,
        uniqueClipIds,
      );
      let isDeleted = false;

      try {
        await removeClips({ clipIds: uniqueClipIds });
        isDeleted = true;
        return true;
      } catch {
        rollbackDeletedClips();
        notifyError(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
        void invalidateClipQueries(queryClient);
        if (isDeleted) {
          void onDeleted?.();
        }
      }
    },
    [isAuthenticated, isDeleting, onDeleted, queryClient],
  );

  const deleteSelected = useCallback(async () => {
    const clipIds = [...selectedClipIds];
    if (clipIds.length === 0) {
      return;
    }

    const isDeleted = await deleteClipsByIds(
      clipIds,
      "선택한 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
    );

    if (isDeleted) {
      setSelectedClipIds(new Set());
      setIsDeleteMode(false);
    }
  }, [deleteClipsByIds, selectedClipIds]);

  const fetchAllFolderClipIds = useCallback(async () => {
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

    return clipIds;
  }, [folderId]);

  const deleteAll = useCallback(async () => {
    if (!isAuthenticated || isDeleting || !folderId) {
      return;
    }

    setIsDeleteAllOpen(false);
    setIsDeleting(true);
    let isDeleted = false;

    try {
      const clipIds = await fetchAllFolderClipIds();

      if (clipIds.length === 0) {
        setIsDeleteMode(false);
        setSelectedClipIds(new Set());
        return;
      }

      const uniqueClipIds = [...new Set(clipIds)];
      await cancelClipQueries(queryClient);
      const rollbackDeletedClips = removeClipsFromCache(
        queryClient,
        uniqueClipIds,
      );

      try {
        await removeClips({ clipIds: uniqueClipIds });
        isDeleted = true;
        setSelectedClipIds(new Set());
        setIsDeleteMode(false);
      } catch {
        rollbackDeletedClips();
        notifyError(
          "현재 폴더의 모든 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
    } catch {
      notifyError(
        "현재 폴더의 모든 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsDeleting(false);
      void invalidateClipQueries(queryClient);
      if (isDeleted) {
        void onDeleted?.();
      }
    }
  }, [
    fetchAllFolderClipIds,
    folderId,
    isAuthenticated,
    isDeleting,
    onDeleted,
    queryClient,
  ]);

  return {
    cancelDeleteMode,
    closeDeleteAllModal,
    deleteAll,
    deleteClip,
    deleteSelected,
    enterDeleteMode,
    isDeleteAllOpen,
    isDeleteMode,
    isDeleting,
    openDeleteAllModal,
    selectedClipCount: selectedClipIds.size,
    selectedClipIds,
    toggleClipSelected,
  };
};
