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
}

export interface UpdateMySubscriptionDto {
  type: UpdateSubscriptionTypeDto;
}

export interface BillingAuthRequestResponseDto {
  clientKey: string;
  customerKey: string;
  method: BillingAuthMethodDto;
  successUrl: string;
  failUrl: string;
}

export interface ConfirmBillingAuthDto {
  authKey: string;
  customerKey: string;
}
