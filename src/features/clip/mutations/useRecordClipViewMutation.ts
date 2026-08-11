"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordClipView } from "@/features/clip/api/clipApi";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

// 클립 복사 후의 최근 사용 기록 요청과 완료 후 목록 갱신을 관리합니다.
export const useRecordClipViewMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: recordClipView,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
  });

  return {
    isPending: mutation.isPending,
    recordClipView: mutation.mutateAsync,
  };
};
