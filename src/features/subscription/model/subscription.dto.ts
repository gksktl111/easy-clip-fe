export type SubscriptionPlanDto = "FREE" | "PRO";

export type SubscriptionStatusDto = "ACTIVE" | "CANCELED" | "EXPIRED";

export type SubscriptionProviderDto = "TOSS_PAYMENTS";

export type BillingAuthMethodDto = "CARD";

export type UpdateSubscriptionTypeDto = "CANCEL" | "RESUME";

export interface MySubscriptionResponseDto {
  plan: SubscriptionPlanDto;
  status: SubscriptionStatusDto;
  autoRenew: boolean;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  provider: SubscriptionProviderDto | null;
  cancellation?: { pendingRenewalPayment: boolean; message: string };
}

export interface UpdateMySubscriptionDto {
  type: UpdateSubscriptionTypeDto;
}

export interface BillingAuthRequestResponseDto {
  price: SubscriptionPriceResponseDto;
  clientKey: string;
  customerKey: string;
  method: BillingAuthMethodDto;
  successUrl: string;
  failUrl: string;
}

export interface ConfirmBillingAuthDto {
  idempotencyKey: string;
  priceVersion: string;
  authKey: string;
  customerKey: string;
}

export interface SubscriptionPriceResponseDto {
  plan: "PRO";
  amount: number;
  currency: "KRW";
  interval: "MONTH";
  intervalCount: 1;
  priceVersion: string;
}

export interface InitialPaymentResponseDto {
  attemptId: string | null;
  status: "PENDING" | "DONE" | "FAILED" | "CANCELED";
  amount?: number;
  currency?: string;
  priceVersion?: string;
  subscription?: MySubscriptionResponseDto;
}
