"use client";

import { useTranslations } from "next-intl";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import {
  getPolicyLimitDetails,
  isPolicyError,
} from "@/shared/access/policyError";
import { requestAccessRefresh } from "@/shared/access/accessEvents";
import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/lib/apiClient";

interface UseTrashActionsOptions {
  onItemsChanged?: () => void | Promise<void>;
}

// 휴지통 복원과 영구 삭제 액션의 중복 실행 방지, 오류 판정, 관련 캐시 갱신을 관리합니다.
export const useTrashActions = ({
  onItemsChanged,
}: UseTrashActionsOptions = {}) => {
  const t = useTranslations("feedback");
  const trash = useTranslations("trash");
  const policy = useTranslations("access");
  const { user } = useAuth();
  const access = useResourceAccess();
  const isAuthenticated = Boolean(user);
  const queryClient = useQueryClient();
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const pendingActionKeyRef = useRef<string | null>(null);

  const refreshRelatedData = useCallback(async () => {
    await invalidateTrashQueries(queryClient);
    await onItemsChanged?.();
  }, [onItemsChanged, queryClient]);

  const runAction = useCallback(
    async (actionKey: string, action: () => Promise<unknown>) => {
      if (
        !isAuthenticated ||
        access.status !== "ready" ||
        pendingActionKeyRef.current
      ) {
        return false;
      }

      pendingActionKeyRef.current = actionKey;
      setPendingActionKey(actionKey);

      try {
        const result = await action();
        if (result && typeof result === "object") {
          if (
            actionKey.includes("restore") &&
            "restoredCount" in result &&
            typeof result.restoredCount === "number"
          )
            notifySuccess(t("restoreSuccess", { count: result.restoredCount }));
          else if (
            "totalDeleted" in result &&
            typeof result.totalDeleted === "number"
          )
            notifySuccess(
              t("permanentDeleteSuccess", { count: result.totalDeleted }),
            );
        }
        await refreshRelatedData().catch(() => undefined);
        requestAccessRefresh();
        return true;
      } catch (actionError) {
        const isRestoreConflict =
          actionKey.includes("restore") &&
          actionError instanceof ApiError &&
          actionError.status === 409;

        const details = isPolicyError(actionError)
          ? getPolicyLimitDetails(actionError)
          : null;
        const countDescription =
          details?.limit != null && details.currentCount != null
            ? policy("limitCount", {
                count: details.currentCount,
                limit: details.limit,
              })
            : "";
        notifyError(
          isPolicyError(actionError)
            ? policy(`errors.${actionError.code}`)
            : trash(isRestoreConflict ? "restoreConflictError" : "actionError"),
          isPolicyError(actionError)
            ? [countDescription, t("policyResolution")]
                .filter(Boolean)
                .join(" · ")
            : undefined,
        );
        await refreshRelatedData().catch(() => undefined);
        return false;
      } finally {
        pendingActionKeyRef.current = null;
        setPendingActionKey(null);
      }
    },
    [isAuthenticated, access.status, refreshRelatedData, t, trash, policy],
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

  return {
    clearAll,
    deleteClip,
    deleteFolder,
    deleteItems,
    pendingActionKey,
    restoreClip,
    restoreFolder,
    restoreItems,
  };
};
