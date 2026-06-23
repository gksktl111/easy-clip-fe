import {
  BillingAuthRequestResponseDto,
  ConfirmBillingAuthDto,
  MySubscriptionResponseDto,
  UpdateMySubscriptionDto,
} from "@/features/subscription/model/subscription.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchMySubscription = async () =>
  apiRequest<MySubscriptionResponseDto>("/subscriptions/me", {
    cache: "no-store",
  });

export const updateMySubscription = async (
  payload: UpdateMySubscriptionDto,
) =>
  apiRequest<MySubscriptionResponseDto>("/subscriptions/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const createBillingAuthRequest = async () =>
  apiRequest<BillingAuthRequestResponseDto>(
    "/subscriptions/me/billing-auth/request",
    {
      method: "POST",
    },
  );

export const confirmBillingAuth = async (payload: ConfirmBillingAuthDto) =>
  apiRequest<MySubscriptionResponseDto>(
    "/subscriptions/me/billing-auth/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
