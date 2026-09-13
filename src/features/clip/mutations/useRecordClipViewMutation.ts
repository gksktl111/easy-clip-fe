"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordClipView } from "@/features/clip/api/clipApi";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

// 클립 복사 후의 최근 사용 기록 요청과 완료 후 최근 목록 갱신을 관리합니다.
export const useRecordClipViewMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: recordClipView,
    // 응답 유실로 기록 여부를 모르는 경우도 최근 목록은 서버에서 재확인합니다.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.recent }),
  });

  return {
    isPending: mutation.isPending,
    recordClipView: mutation.mutateAsync,
  };
};
