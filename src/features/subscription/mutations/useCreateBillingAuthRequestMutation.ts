"use client";

import { useMutation } from "@tanstack/react-query";
import { createBillingAuthRequest } from "@/features/subscription/api/subscriptionApi";

export const useCreateBillingAuthRequestMutation = () =>
  useMutation({
    mutationFn: createBillingAuthRequest,
  });
