import { queryOptions } from "@tanstack/react-query";
import { fetchMySubscription } from "@/features/subscription/api/subscriptionApi";
import { getMySubscriptionQueryKey } from "@/features/subscription/service/subscriptionQueryCache";

export const mySubscriptionQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: getMySubscriptionQueryKey(userId),
    queryFn: fetchMySubscription,
    staleTime: 5 * 60 * 1000,
  });
