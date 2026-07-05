"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { fetchMySubscription } from "@/features/subscription/api/subscriptionApi";
import { getMySubscriptionQueryKey } from "@/features/subscription/service/subscriptionQueryCache";

export {
  getMySubscriptionQueryKey,
  MY_SUBSCRIPTION_QUERY_KEY,
} from "@/features/subscription/service/subscriptionQueryCache";

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
