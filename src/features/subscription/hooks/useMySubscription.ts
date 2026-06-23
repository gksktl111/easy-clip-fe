"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { fetchMySubscription } from "@/features/subscription/api/subscriptionApi";

export const MY_SUBSCRIPTION_QUERY_KEY = "mySubscription";

export const getMySubscriptionQueryKey = (userId: string | null) =>
  [MY_SUBSCRIPTION_QUERY_KEY, userId] as const;

export const useMySubscription = () => {
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const userId = session?.user?.id ?? null;
  const queryKey = useMemo(() => getMySubscriptionQueryKey(userId), [userId]);
  const query = useQuery({
    queryKey,
    enabled: isAuthenticated,
    queryFn: fetchMySubscription,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isAuthenticated,
    queryKey,
    subscription: isAuthenticated ? (query.data ?? null) : null,
  };
};
