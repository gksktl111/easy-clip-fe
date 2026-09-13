import {
  BillingAuthRequestResponseDto,
  InitialPaymentResponseDto,
  SubscriptionPriceResponseDto,
  ConfirmBillingAuthDto,
  MySubscriptionResponseDto,
  UpdateMySubscriptionDto,
} from "@/features/subscription/model/subscription.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchMySubscription = async (signal?: AbortSignal) =>
  apiRequest<MySubscriptionResponseDto>("/subscriptions/me", {
    cache: "no-store",
    signal,
  });

export const updateMySubscription = async (payload: UpdateMySubscriptionDto) =>
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
  apiRequest<InitialPaymentResponseDto>(
    "/subscriptions/me/billing-auth/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

export const fetchSubscriptionPrice = async (signal?: AbortSignal) => {
  const price = await apiRequest<SubscriptionPriceResponseDto>(
    "/subscriptions/pricing",
    { signal, cache: "no-store", credentials: "omit", skipAuthRefresh: true },
  );
  if (
    !price ||
    price.plan !== "PRO" ||
    !Number.isSafeInteger(price.amount) ||
    price.amount <= 0 ||
    price.currency !== "KRW" ||
    price.interval !== "MONTH" ||
    price.intervalCount !== 1 ||
    typeof price.priceVersion !== "string" ||
    !price.priceVersion.trim()
  ) {
    throw new Error("INVALID_SUBSCRIPTION_PRICE");
  }
  return price;
};

export const fetchInitialPayment = (idempotencyKey: string) =>
  apiRequest<InitialPaymentResponseDto>(
    `/subscriptions/me/billing/payments/${encodeURIComponent(idempotencyKey)}`,
    { cache: "no-store" },
  );

export const reconcileInitialPayment = (idempotencyKey: string) =>
  apiRequest<InitialPaymentResponseDto>(
    `/subscriptions/me/billing/payments/${encodeURIComponent(idempotencyKey)}/reconcile`,
    { method: "POST" },
  );
