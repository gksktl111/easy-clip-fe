"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { PRICING_PLANS } from "@/features/pricing/const/pricingContent";
import {
  fetchMySubscription,
  updateMySubscription,
} from "@/features/subscription/api/subscriptionApi";
import { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";
import { notifyError, notifySuccess } from "@/shared/lib/toast";

const isProPlan = (subscription: MySubscriptionResponseDto | null) =>
  subscription?.plan === "PRO" && subscription.status === "ACTIVE";

export function PricingPlansSection() {
  const router = useRouter();
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const [subscription, setSubscription] =
    useState<MySubscriptionResponseDto | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);
  const isCurrentProPlan = isProPlan(subscription);

  useEffect(() => {
    if (!session?.user) {
      setSubscription(null);
      return;
    }

    let isMounted = true;

    fetchMySubscription()
      .then((nextSubscription) => {
        if (isMounted) {
          setSubscription(nextSubscription);
        }
      })
      .catch(() => {
        if (isMounted) {
          notifyError("구독 정보를 불러오지 못했습니다.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user]);

  const handleCancelSubscription = async () => {
    if (isCancelingSubscription) {
      return;
    }

    setIsCancelingSubscription(true);

    try {
      await updateMySubscription({ type: "CANCEL" });
      notifySuccess("Pro 구독이 취소되었습니다.");
      setIsCancelModalOpen(false);
      router.push("/favorites");
    } catch {
      notifyError("구독 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  return (
    <>
      <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 lg:mt-16 lg:grid-cols-[0.95fr_1.05fr]">
        {PRICING_PLANS.map((plan) => {
          const isFreePlan = !plan.highlight;
          const isCurrentFreePlan =
            isAuthenticated && isFreePlan && !isCurrentProPlan;
          const isCurrentProPlanCard = isAuthenticated && plan.highlight && isCurrentProPlan;

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
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--pricing-featured-badge)" }}
                  >
                    Recommended
                  </span>
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
                <button
                  type="button"
                  disabled
                  className="mt-8 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-(--border) bg-(--surface-muted) px-5 py-3 text-sm font-semibold text-(--muted)"
                >
                  현재 플랜
                </button>
              ) : isAuthenticated && isFreePlan && isCurrentProPlan ? (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="mt-8 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-(--border) bg-(--surface-muted) px-5 py-3 text-sm font-semibold text-(--foreground) transition hover:bg-(--surface-elevated)"
                >
                  Free로 전환하기
                </button>
              ) : (
                <Link
                  href={plan.ctaHref}
                  className="mt-8 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-[opacity,transform] duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: plan.highlight
                      ? "var(--pricing-button-featured-bg)"
                      : "var(--pricing-button-bg)",
                    color: plan.highlight
                      ? "var(--pricing-button-featured-fg)"
                      : "var(--pricing-button-fg)",
                  }}
                >
                  <span
                    style={{
                      color: plan.highlight
                        ? "var(--pricing-button-featured-fg)"
                        : "var(--pricing-button-fg)",
                    }}
                  >
                    {plan.ctaLabel}
                  </span>
                </Link>
              )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-strong) px-4">
          <div className="w-full max-w-sm rounded-2xl border border-(--border) bg-(--surface-elevated) p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Pro 구독을 취소할까요?</h2>
            <p className="mt-3 text-sm leading-6 text-(--muted)">
              확인을 누르면 Pro 구독의 자동 갱신이 중지되고 Free 플랜으로
              전환됩니다.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelingSubscription}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleCancelSubscription();
                }}
                disabled={isCancelingSubscription}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelingSubscription ? "변경 중" : "예"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
