"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMySubscription } from "@/features/subscription/api/subscriptionApi";
import { getMySubscriptionQueryKey } from "@/features/subscription/service/subscriptionQueryCache";
import { useSession } from "@/shared/session/useSession";

// 인증된 사용자의 현재 구독을 조회하고 화면에 필요한 상태만 제공합니다.
export const useMySubscription = () => {
  const { user } = useSession();
  const isAuthenticated = Boolean(user);
  const userId = user?.id ?? null;
  const queryKey = getMySubscriptionQueryKey(userId);
  const query = useQuery({
    queryKey,
    enabled: isAuthenticated,
    queryFn: fetchMySubscription,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isAuthenticated,
    isError: isAuthenticated && query.isError,
    isPending: isAuthenticated && query.isPending,
    subscription: isAuthenticated ? (query.data ?? null) : null,
  };
};
