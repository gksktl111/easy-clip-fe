import type { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";

export const isActiveProSubscription = (
  subscription: MySubscriptionResponseDto | null,
) => subscription?.status === "ACTIVE" && hasEstimatedProAccess(subscription);

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

// 서버의 isLocked가 최종 기준이며 이 값은 플랜 안내·재정렬 진입 판단에만 사용합니다.
export const hasEstimatedProAccess = (
  subscription: MySubscriptionResponseDto | null,
  now = Date.now(),
) => {
  const end = subscription?.currentPeriodEnd
    ? Date.parse(subscription.currentPeriodEnd)
    : NaN;
  return (
    subscription?.plan === "PRO" &&
    (subscription.status === "ACTIVE" || subscription.status === "CANCELED") &&
    Number.isFinite(end) &&
    end > now
  );
};
