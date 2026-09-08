"use client";

import { requestAccessRefresh } from "@/shared/access/accessEvents";
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
  if (userId) {
    queryClient.setQueryData(getMySubscriptionQueryKey(userId), subscription);
  } else {
    void invalidateMySubscriptionQueries(queryClient);
  }
  requestAccessRefresh();
};

export const invalidateMySubscriptionQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    queryKey: [MY_SUBSCRIPTION_QUERY_KEY],
  });
