"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth";
import {
  fetchMySubscription,
  updateMySubscription,
} from "@/features/subscription/api/subscriptionApi";
import { syncMySubscriptionQueryData } from "@/features/subscription/service/subscriptionQueryCache";

// 구독 변경 요청과 현재 사용자 구독 캐시 동기화를 하나의 공개 액션으로 제공합니다.
export const useSubscriptionActions = () => {
  const queryClient = useQueryClient();
  const session = useAuthSession();
  const userId = session?.user?.id ?? null;

  const syncSubscription = useCallback(async () => {
    const subscription = await fetchMySubscription();
    syncMySubscriptionQueryData(queryClient, subscription, userId);
    return subscription;
  }, [queryClient, userId]);

  const cancelSubscription = useCallback(async () => {
    const subscription = await updateMySubscription({ type: "CANCEL" });
    syncMySubscriptionQueryData(queryClient, subscription, userId);
    return subscription;
  }, [queryClient, userId]);

  const resumeSubscription = useCallback(async () => {
    const subscription = await updateMySubscription({ type: "RESUME" });
    syncMySubscriptionQueryData(queryClient, subscription, userId);
    return subscription;
  }, [queryClient, userId]);

  return {
    cancelSubscription,
    resumeSubscription,
    syncSubscription,
  };
};
