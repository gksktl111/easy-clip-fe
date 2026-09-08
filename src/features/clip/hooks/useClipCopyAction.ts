"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRecordClipViewMutation } from "@/features/clip/mutations/useRecordClipViewMutation";
import type { Clip } from "@/features/clip/model/clip";
import { copyClipToClipboard } from "@/features/clip/service/clipClipboard";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";

interface UseClipCopyActionOptions {
  isAuthenticated: boolean;
  isDisabled?: boolean;
}

// 클립 복사, 최근 사용 기록 mutation 호출과 공통 토스트를 처리합니다.
export const useClipCopyAction = ({
  isAuthenticated,
  isDisabled = false,
}: UseClipCopyActionOptions) => {
  const pending = useRef(false);
  const [pendingCopyClipId, setPendingCopyClipId] = useState<string | null>(
    null,
  );
  const access = useResourceAccess();
  const t = useTranslations("feedback");
  const { recordClipView } = useRecordClipViewMutation();

  const copyClip = useCallback(
    async (clip: Clip) => {
      if (
        pending.current ||
        isDisabled ||
        access.status !== "ready" ||
        !clip.folderId ||
        access.folderLocks[clip.folderId] !== false
      ) {
        return;
      }

      pending.current = true;
      setPendingCopyClipId(clip.id);
      try {
        await copyClipToClipboard(clip);
      } catch {
        notifyError(t("copyError"), undefined, "clip-copy");
        return;
      } finally {
        pending.current = false;
        setPendingCopyClipId(null);
      }

      notifySuccess(t("copySuccess"), undefined, "clip-copy");

      if (isAuthenticated) {
        void recordClipView(clip.id).catch(() => {
          // 복사는 이미 성공했으므로 조회 기록 실패는 사용자에게 노출하지 않습니다.
        });
      }
    },
    [isAuthenticated, isDisabled, recordClipView, t, access],
  );

  return {
    copyClip,
    pendingCopyClipId,
  };
};
