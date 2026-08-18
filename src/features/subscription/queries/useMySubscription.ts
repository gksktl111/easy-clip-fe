"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { mySubscriptionQueryOptions } from "@/features/subscription/queries/mySubscriptionQueryOptions";
import { useSession } from "@/shared/session/useSession";

// 인증된 사용자의 현재 구독을 조회하고 화면에 필요한 상태만 제공합니다.
export const useMySubscription = () => {
  const { user } = useSession();
  const isAuthenticated = Boolean(user);
  const userId = user?.id ?? null;
  const query = useQuery({
    ...mySubscriptionQueryOptions(userId),
    enabled: isAuthenticated,
  });
  const refetchSubscription = useCallback(async () => {
    const { data } = await query.refetch({ throwOnError: true });

    return data ?? null;
  }, [query]);

  return {
    isAuthenticated,
    isError: isAuthenticated && query.isError,
    isPending: isAuthenticated && query.isPending,
    refetchSubscription,
    subscription: isAuthenticated ? (query.data ?? null) : null,
  };
};
