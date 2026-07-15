"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { recordClipView } from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import type { Clip } from "@/features/clip/model/clip";
import { copyClipToClipboard } from "@/features/clip/service/clipClipboard";
import {
  invalidateClipQueries,
  moveClipToRecentCache,
} from "@/features/clip/service/clipQueryCache";
import { notifyError } from "@/shared/feedback/toast";

interface CopyFeedbackPosition {
  x: number;
  y: number;
}

interface UseClipCopyActionOptions {
  isAuthenticated: boolean;
  isDisabled?: boolean;
}

// 클립 복사, 최근 사용 기록, 관련 캐시 갱신과 선택적 위치 피드백을 처리합니다.
export const useClipCopyAction = ({
  isAuthenticated,
  isDisabled = false,
}: UseClipCopyActionOptions) => {
  const queryClient = useQueryClient();
  const { copyToast, showCopyToast } = useCopyToast();

  const copyClip = useCallback(
    async (clip: Clip, feedbackPosition?: CopyFeedbackPosition) => {
      if (isDisabled) {
        return;
      }

      try {
        await copyClipToClipboard(clip);
      } catch {
        notifyError("클립을 복사하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (feedbackPosition) {
        showCopyToast(feedbackPosition.x, feedbackPosition.y);
      }

      if (isAuthenticated) {
        try {
          await recordClipView(clip.id);
          moveClipToRecentCache(queryClient, clip.id);
          void invalidateClipQueries(queryClient);
        } catch {
          // 복사는 이미 성공했으므로 조회 기록 실패는 사용자에게 노출하지 않습니다.
        }
      }
    },
    [isAuthenticated, isDisabled, queryClient, showCopyToast],
  );

  return {
    copyClip,
    copyToast,
  };
};
