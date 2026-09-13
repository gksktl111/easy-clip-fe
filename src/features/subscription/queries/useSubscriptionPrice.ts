"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchSubscriptionPrice } from "../api/subscriptionApi";

export const subscriptionPriceQueryOptions = () =>
  queryOptions({
    queryKey: ["subscription-price"],
    queryFn: ({ signal }) => fetchSubscriptionPrice(signal),
    staleTime: 0,
    retry: false,
  });

export const useSubscriptionPrice = () =>
  useQuery(subscriptionPriceQueryOptions());
