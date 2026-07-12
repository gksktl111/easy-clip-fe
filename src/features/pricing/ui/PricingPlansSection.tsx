"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HiCheck } from "react-icons/hi";
import { PRICING_PLANS } from "@/features/pricing/const/pricingContent";
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
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";
import { ApiError } from "@/shared/lib/apiClient";

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

  const formatSubscriptionDate = (value: string | null) => {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

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

  return (
    <>
      <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 lg:mt-16 lg:grid-cols-[0.95fr_1.05fr]">
        {PRICING_PLANS.map((plan) => {
          const isFreePlan = !plan.highlight;
          const isCurrentFreePlan =
            isAuthenticated && isFreePlan && subscription?.plan === "FREE";
          const isCurrentProPlanCard =
            isAuthenticated && plan.highlight && isCurrentProPlan;
          const isResumeTargetPlan =
            isAuthenticated && plan.highlight && isResumableProPlan;
          const proStatusLabel = isCurrentProPlan
            ? "현재 PRO 이용 중"
            : isResumableProPlan
              ? "현재 PRO 이용 중"
              : null;
          const proRenewalLabel = isCurrentProPlan
            ? subscription?.autoRenew
              ? "자동갱신 활성화됨"
              : "자동갱신 비활성화됨"
            : isResumableProPlan
              ? "자동갱신 중지됨"
              : null;
          const proBillingDateLabel = isCurrentProPlan
            ? "다음 결제일"
            : isResumableProPlan
              ? "이용 종료일"
              : null;
          const proBillingDateValue = isCurrentProPlan
            ? subscription?.nextBillingAt
            : isResumableProPlan
              ? subscription?.currentPeriodEnd
              : null;

          return (
            <article
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl border px-5 py-6 transition-transform duration-300 hover:-translate-y-1 sm:rounded-[2rem] sm:px-8 sm:py-8 ${
                plan.highlight
                  ? "border-transparent text-white"
                  : "border-(--border) bg-(--surface)"
              }`}
              style={{
                boxShadow: "var(--pricing-card-shadow)",
                background: plan.highlight
                  ? "var(--pricing-featured-bg)"
                  : undefined,
              }}
            >
              {plan.highlight ? (
                <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.92),rgba(255,255,255,0))]" />
              ) : null}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      plan.highlight
                        ? "text-[var(--pricing-featured-muted)]"
                        : "text-(--muted)"
                    }`}
                  >
                    {plan.badge}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                    {plan.name}
                  </h2>
                </div>
                {plan.highlight ? (
                  <Badge
                    variant="featured"
                    size="sm"
                    style={{ backgroundColor: "var(--pricing-featured-badge)" }}
                  >
                    Recommended
                  </Badge>
                ) : null}
              </div>

              <p
                className={`mt-5 text-sm leading-6 sm:text-base sm:leading-7 ${
                  plan.highlight
                    ? "text-[var(--pricing-featured-text)]"
                    : "text-(--muted)"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {plan.price}
                </span>
                {plan.priceSuffix ? (
                  <span
                    className={`pb-1 text-sm ${
                      plan.highlight
                        ? "text-[var(--pricing-featured-text)]"
                        : "text-(--muted)"
                    }`}
                  >
                    {plan.priceSuffix}
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-2 text-sm ${
                  plan.highlight
                    ? "text-[var(--pricing-featured-text)]"
                    : "text-(--muted)"
                }`}
              >
                {plan.billingNote}
              </p>

              {isCurrentFreePlan || isCurrentProPlanCard ? (
                <Button
                  disabled
                  variant="secondaryMuted"
                  size="lg"
                  fullWidth
                  className="mt-8 cursor-not-allowed rounded-2xl font-semibold text-(--muted) disabled:cursor-not-allowed disabled:opacity-100"
                >
                  현재 플랜
                </Button>
              ) : isResumeTargetPlan ? (
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
              ) : isAuthenticated && isFreePlan && isCurrentProPlan ? (
                <Button
                  onClick={() => setIsCancelModalOpen(true)}
                  variant="secondaryMuted"
                  size="lg"
                  fullWidth
                  className="mt-8 rounded-2xl font-semibold"
                >
                  Free로 전환하기
                </Button>
              ) : (
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
              )}

              {plan.highlight && proStatusLabel ? (
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
                  <p className="font-semibold">{proStatusLabel}</p>
                  <p className="mt-1 text-[var(--pricing-featured-text)]">
                    {proRenewalLabel}
                  </p>
                  {proBillingDateLabel ? (
                    <p className="mt-1 text-[var(--pricing-featured-text)]">
                      {proBillingDateLabel}:{" "}
                      {formatSubscriptionDate(proBillingDateValue ?? null)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        plan.highlight ? "bg-white/12 text-white" : ""
                      }`}
                      style={
                        plan.highlight
                          ? { backgroundColor: "var(--pricing-featured-badge)" }
                          : {
                              backgroundColor: "var(--pricing-check-bg)",
                              color: "var(--pricing-check-fg)",
                            }
                      }
                    >
                      <HiCheck className="h-4 w-4" />
                    </span>
                    <span
                      className={`text-sm leading-6 ${
                        plan.highlight ? "text-white" : "text-(--foreground)"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {isCancelModalOpen ? (
        <Modal overlay="strong" contentClassName="w-full max-w-sm">
          <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Pro 구독을 취소할까요?</h2>
            <p className="mt-3 text-sm leading-6 text-(--muted)">
              확인을 누르면 Pro 구독의 자동 갱신이 중지되고 Free 플랜으로
              전환됩니다.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelingSubscription}
                variant="secondary"
                size="lg"
                className="min-h-0 flex-1 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                아니오
              </Button>
              <Button
                onClick={() => {
                  void handleCancelSubscription();
                }}
                disabled={isCancelingSubscription}
                variant="primary"
                size="lg"
                className="min-h-0 flex-1 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelingSubscription ? "변경 중" : "예"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
