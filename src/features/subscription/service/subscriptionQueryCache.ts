"use client";

import { QueryClient } from "@tanstack/react-query";
import type { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";

export const MY_SUBSCRIPTION_QUERY_KEY = "mySubscription";

export const getMySubscriptionQueryKey = (userId: string | null) =>
  [MY_SUBSCRIPTION_QUERY_KEY, userId] as const;

export const syncMySubscriptionQueryData = (
  queryClient: QueryClient,
  subscription: MySubscriptionResponseDto,
  userId: string | null,
) => {
  queryClient.setQueriesData<MySubscriptionResponseDto>(
    { queryKey: [MY_SUBSCRIPTION_QUERY_KEY] },
    subscription,
  );

  if (userId) {
    queryClient.setQueryData(getMySubscriptionQueryKey(userId), subscription);
  }
};

export const invalidateMySubscriptionQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    queryKey: [MY_SUBSCRIPTION_QUERY_KEY],
  });
