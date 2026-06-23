import { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";

export const isActiveProSubscription = (
  subscription: MySubscriptionResponseDto | null,
) => subscription?.plan === "PRO" && subscription.status === "ACTIVE";

export const hasRemainingCanceledProPeriod = (
  subscription: MySubscriptionResponseDto | null,
  now = new Date(),
) => {
  if (
    subscription?.plan !== "PRO" ||
    subscription.status !== "CANCELED" ||
    !subscription.currentPeriodEnd
  ) {
    return false;
  }

  const currentPeriodEnd = new Date(subscription.currentPeriodEnd);

  return (
    !Number.isNaN(currentPeriodEnd.getTime()) &&
    currentPeriodEnd.getTime() > now.getTime()
  );
};
