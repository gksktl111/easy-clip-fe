"use client";

import { useCallback, useMemo, useState } from "react";
import { useClipDeletionMutation } from "@/features/clip/mutations/useClipDeletionMutation";
import type { Clip } from "@/features/clip/model/clip";
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
  const {
    deleteAll: deleteAllMutation,
    deleteClip: deleteClipMutation,
    deleteClips: deleteClipsMutation,
    isDeleting,
  } = useClipDeletionMutation({
    folderId,
    isAuthenticated,
    onDeleted,
  });
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(
    () => new Set(),
  );
  const availableClipIds = useMemo(
    () => new Set(clips.map((clip) => clip.id)),
    [clips],
  );
  const selectedAvailableClipIds = useMemo(
    () =>
      new Set(
        [...selectedClipIds].filter((clipId) => availableClipIds.has(clipId)),
      ),
    [availableClipIds, selectedClipIds],
  );

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

      try {
        await deleteClipMutation(clipId);
      } catch {
        notifyError("클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    },
    [deleteClipMutation, isAuthenticated, isDeleting],
  );

  const deleteSelected = useCallback(async () => {
    const clipIds = [...selectedAvailableClipIds];
    if (clipIds.length === 0) {
      return;
    }

    let isDeleted = false;

    try {
      isDeleted = await deleteClipsMutation(clipIds);
    } catch {
      notifyError("선택한 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    if (isDeleted) {
      setSelectedClipIds(new Set());
      setIsDeleteMode(false);
    }
  }, [deleteClipsMutation, selectedAvailableClipIds]);

  const deleteAll = useCallback(async () => {
    if (!isAuthenticated || isDeleting || !folderId) {
      return;
    }

    setIsDeleteAllOpen(false);

    try {
      const result = await deleteAllMutation();

      if (result === "deleted" || result === "empty") {
        setSelectedClipIds(new Set());
        setIsDeleteMode(false);
      }
    } catch {
      notifyError(
        "현재 폴더의 모든 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
  }, [deleteAllMutation, folderId, isAuthenticated, isDeleting]);

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
    selectedClipCount: selectedAvailableClipIds.size,
    selectedClipIds: selectedAvailableClipIds,
    toggleClipSelected,
  };
};
