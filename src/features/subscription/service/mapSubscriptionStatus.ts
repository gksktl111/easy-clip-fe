import type { MySubscriptionResponseDto } from "../model/subscription.dto";
import type { SubscriptionStatus } from "../model/subscriptionStatus";

const parseDate = (value: string | null): number =>
  value ? Date.parse(value) : NaN;

export function mapSubscriptionStatus(
  subscription: MySubscriptionResponseDto | null | undefined,
  now = Date.now(),
): SubscriptionStatus {
  if (!subscription) return { kind: "unavailable", plan: null };
  if (subscription.plan === "FREE" || subscription.status === "EXPIRED") {
    return { kind: "free", plan: "FREE" };
  }

  const periodEnd = parseDate(subscription.currentPeriodEnd);
  if (!Number.isFinite(periodEnd)) {
    return { kind: "unavailable", plan: null };
  }
  if (periodEnd <= now) return { kind: "free", plan: "FREE" };

  const currentPeriodEnd = new Date(periodEnd).toISOString();
  if (subscription.status === "CANCELED") {
    return { kind: "canceled", plan: "PRO", currentPeriodEnd };
  }

  const nextBilling = parseDate(subscription.nextBillingAt);
  return {
    kind: "active",
    plan: "PRO",
    currentPeriodEnd,
    autoRenew: subscription.autoRenew,
    nextBillingAt:
      subscription.autoRenew && Number.isFinite(nextBilling)
        ? new Date(nextBilling).toISOString()
        : null,
  };
}
