"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { CLIP_QUERY_KEY } from "@/features/clip/service/clipQueryCache";
import { FOLDER_QUERY_KEY } from "@/features/folder/service/folderQueryCache";
import {
  deleteAllTrashItems,
  deleteTrashClip,
  deleteTrashFolder,
  deleteTrashItems,
  restoreTrashClip,
  restoreTrashFolder,
  restoreTrashItems,
} from "@/features/trash/api/trashApi";
import type { TrashItemMutationDto } from "@/features/trash/model/trash.dto";
import { invalidateTrashQueries } from "@/features/trash/service/trashQueryCache";
import { ApiError } from "@/shared/lib/apiClient";

export type TrashActionError = "action" | "restoreConflict";

// 휴지통 복원과 영구 삭제 액션의 중복 실행 방지, 오류 판정, 관련 캐시 갱신을 관리합니다.
export const useTrashActions = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const queryClient = useQueryClient();
  const [error, setError] = useState<TrashActionError | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const pendingActionKeyRef = useRef<string | null>(null);

  const refreshRelatedData = useCallback(async () => {
    await Promise.all([
      invalidateTrashQueries(queryClient),
      queryClient.invalidateQueries({ queryKey: [FOLDER_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [CLIP_QUERY_KEY] }),
    ]);
  }, [queryClient]);

  const runAction = useCallback(
    async (actionKey: string, action: () => Promise<unknown>) => {
      if (!isAuthenticated || pendingActionKeyRef.current) {
        return false;
      }

      pendingActionKeyRef.current = actionKey;
      setPendingActionKey(actionKey);
      setError(null);

      try {
        await action();
        await refreshRelatedData();
        return true;
      } catch (actionError) {
        const isRestoreConflict =
          actionKey.includes("restore") &&
          actionError instanceof ApiError &&
          actionError.status === 409;

        setError(isRestoreConflict ? "restoreConflict" : "action");
        await refreshRelatedData().catch(() => undefined);
        return false;
      } finally {
        pendingActionKeyRef.current = null;
        setPendingActionKey(null);
      }
    },
    [isAuthenticated, refreshRelatedData],
  );

  const restoreClip = useCallback(
    (clipId: string) =>
      runAction(`clip-restore-${clipId}`, () => restoreTrashClip(clipId)),
    [runAction],
  );
  const restoreItems = useCallback(
    (items: TrashItemMutationDto[]) =>
      items.length > 0
        ? runAction("trash-restore-selected", () => restoreTrashItems(items))
        : Promise.resolve(false),
    [runAction],
  );
  const deleteClip = useCallback(
    (clipId: string) =>
      runAction(`clip-delete-${clipId}`, () => deleteTrashClip(clipId)),
    [runAction],
  );
  const deleteItems = useCallback(
    (items: TrashItemMutationDto[]) =>
      items.length > 0
        ? runAction("trash-delete-selected", () => deleteTrashItems(items))
        : Promise.resolve(false),
    [runAction],
  );
  const restoreFolder = useCallback(
    (folderId: string) =>
      runAction(`folder-restore-${folderId}`, () =>
        restoreTrashFolder(folderId),
      ),
    [runAction],
  );
  const deleteFolder = useCallback(
    (folderId: string) =>
      runAction(`folder-delete-${folderId}`, () => deleteTrashFolder(folderId)),
    [runAction],
  );
  const clearAll = useCallback(
    () => runAction("trash-clear-all", deleteAllTrashItems),
    [runAction],
  );
  const clearError = useCallback(() => setError(null), []);

  return {
    clearAll,
    clearError,
    deleteClip,
    deleteFolder,
    deleteItems,
    error,
    pendingActionKey,
    restoreClip,
    restoreFolder,
    restoreItems,
  };
};
