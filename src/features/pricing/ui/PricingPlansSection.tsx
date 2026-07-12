"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  PRICING_PLANS,
  type PricingPlan,
} from "@/features/pricing/const/pricingContent";
import { PricingCancelModal } from "@/features/pricing/ui/PricingCancelModal";
import { PricingPlanCard } from "@/features/pricing/ui/PricingPlanCard";
import {
  fetchMySubscription,
  updateMySubscription,
} from "@/features/subscription/api/subscriptionApi";
import { useMySubscription } from "@/features/subscription/hooks/useMySubscription";
import {
  hasRemainingCanceledProPeriod,
  isActiveProSubscription,
} from "@/features/subscription/model/subscription";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { ApiError } from "@/shared/lib/apiClient";
import { Button } from "@/shared/ui/button/Button";

const formatSubscriptionDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

// 구독 상태에 맞는 요금제 카드 액션과 취소 흐름을 조합합니다.
export function PricingPlansSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    queryKey: subscriptionQueryKey,
    subscription,
  } = useMySubscription();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);
  const [isResumingSubscription, setIsResumingSubscription] = useState(false);
  const isCurrentProPlan = isActiveProSubscription(subscription);
  const isResumableProPlan = hasRemainingCanceledProPeriod(subscription);

  const handleCancelSubscription = async () => {
    if (isCancelingSubscription) {
      return;
    }

    setIsCancelingSubscription(true);

    try {
      const nextSubscription = await updateMySubscription({ type: "CANCEL" });
      queryClient.setQueryData(subscriptionQueryKey, nextSubscription);
      notifySuccess("Pro 구독이 취소되었습니다.");
      setIsCancelModalOpen(false);
      router.push("/favorites");
    } catch {
      notifyError("구독 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  const syncSubscription = async () => {
    const nextSubscription = await fetchMySubscription();
    queryClient.setQueryData(subscriptionQueryKey, nextSubscription);
    return nextSubscription;
  };

  const handleResumeSubscription = async () => {
    if (isResumingSubscription) {
      return;
    }

    setIsResumingSubscription(true);

    try {
      const nextSubscription = await updateMySubscription({ type: "RESUME" });
      queryClient.setQueryData(subscriptionQueryKey, nextSubscription);
      notifySuccess("Pro 구독 자동갱신이 재개되었습니다.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const latestSubscription = await syncSubscription().catch(() => null);

        if (isActiveProSubscription(latestSubscription)) {
          notifySuccess("Pro 구독 자동갱신이 재개되었습니다.");
          return;
        }
      }

      notifyError("구독 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsResumingSubscription(false);
    }
  };

  const renderPlanAction = (plan: PricingPlan) => {
    const isFreePlan = !plan.highlight;
    const isCurrentFreePlan =
      isAuthenticated && isFreePlan && subscription?.plan === "FREE";
    const isCurrentProPlanCard =
      isAuthenticated && plan.highlight && isCurrentProPlan;
    const isResumeTargetPlan =
      isAuthenticated && plan.highlight && isResumableProPlan;

    if (isCurrentFreePlan || isCurrentProPlanCard) {
      return (
        <Button
          disabled
          variant="secondaryMuted"
          size="lg"
          fullWidth
          className="mt-8 cursor-not-allowed rounded-2xl font-semibold text-(--muted) disabled:cursor-not-allowed disabled:opacity-100"
        >
          현재 플랜
        </Button>
      );
    }

    if (isResumeTargetPlan) {
      return (
        <Button
          onClick={() => {
            void handleResumeSubscription();
          }}
          disabled={isResumingSubscription}
          variant="pricingFeatured"
          size="lg"
          fullWidth
          className="mt-8 rounded-2xl font-semibold transition-[opacity,transform] duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResumingSubscription ? "재개 중" : "구독 재개"}
        </Button>
      );
    }

    if (isAuthenticated && isFreePlan && isCurrentProPlan) {
      return (
        <Button
          onClick={() => setIsCancelModalOpen(true)}
          variant="secondaryMuted"
          size="lg"
          fullWidth
          className="mt-8 rounded-2xl font-semibold"
        >
          Free로 전환하기
        </Button>
      );
    }

    return (
      <Link
        href={plan.ctaHref}
        className={`mt-8 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-[background-color,opacity,transform] duration-200 hover:opacity-90 ${
          plan.highlight
            ? "bg-(--pricing-button-featured-bg) text-(--pricing-button-featured-fg) hover:bg-(--pricing-button-featured-bg-hover)"
            : "bg-(--pricing-button-bg) text-(--pricing-button-fg) hover:bg-(--pricing-button-bg-hover)"
        }`}
      >
        <span>{plan.ctaLabel}</span>
      </Link>
    );
  };

  const renderPlanStatus = (plan: PricingPlan) => {
    if (!plan.highlight || (!isCurrentProPlan && !isResumableProPlan)) {
      return null;
    }

    const renewalLabel = isCurrentProPlan
      ? subscription?.autoRenew
        ? "자동갱신 활성화됨"
        : "자동갱신 비활성화됨"
      : "자동갱신 중지됨";
    const billingDateLabel = isCurrentProPlan ? "다음 결제일" : "이용 종료일";
    const billingDateValue = isCurrentProPlan
      ? subscription?.nextBillingAt
      : subscription?.currentPeriodEnd;

    return (
      <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
        <p className="font-semibold">현재 PRO 이용 중</p>
        <p className="mt-1 text-[var(--pricing-featured-text)]">
          {renewalLabel}
        </p>
        <p className="mt-1 text-[var(--pricing-featured-text)]">
          {billingDateLabel}: {formatSubscriptionDate(billingDateValue ?? null)}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 lg:mt-16 lg:grid-cols-[0.95fr_1.05fr]">
        {PRICING_PLANS.map((plan) => (
          <PricingPlanCard
            key={plan.name}
            plan={plan}
            action={renderPlanAction(plan)}
            status={renderPlanStatus(plan)}
          />
        ))}
      </div>

      {isCancelModalOpen ? (
        <PricingCancelModal
          isCanceling={isCancelingSubscription}
          onCancel={() => setIsCancelModalOpen(false)}
          onConfirm={() => {
            void handleCancelSubscription();
          }}
        />
      ) : null}
    </>
  );
}
