"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMySubscription } from "@/features/subscription/api/subscriptionApi";
import {
  invalidateMySubscriptionQueries,
  syncMySubscriptionQueryData,
} from "@/features/subscription/service/subscriptionQueryCache";
import { useSession } from "@/shared/session/useSession";

// 구독 변경 요청과 현재 사용자 구독 캐시 동기화를 하나의 공개 액션으로 제공합니다.
export const useSubscriptionActions = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const userId = user?.id ?? null;

  const syncQueryData = useCallback(
    (subscription: Awaited<ReturnType<typeof updateMySubscription>>) => {
      syncMySubscriptionQueryData(queryClient, subscription, userId);
    },
    [queryClient, userId],
  );

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => updateMySubscription({ type: "CANCEL" }),
    onSuccess: syncQueryData,
  });

  const resumeSubscriptionMutation = useMutation({
    mutationFn: () => updateMySubscription({ type: "RESUME" }),
    onSuccess: syncQueryData,
  });

  const invalidateSubscription = useCallback(
    () => invalidateMySubscriptionQueries(queryClient),
    [queryClient],
  );

  return {
    cancelSubscription: cancelSubscriptionMutation.mutateAsync,
    invalidateSubscription,
    resumeSubscription: resumeSubscriptionMutation.mutateAsync,
  };
};
