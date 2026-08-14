"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  PRICING_PLANS,
  type PricingPlan,
} from "@/features/pricing/const/pricingContent";
import { PricingCancelModal } from "@/features/pricing/ui/PricingCancelModal";
import {
  PricingPlanCard,
  type PricingPlanContent,
} from "@/features/pricing/ui/PricingPlanCard";
import { PricingPlanAction } from "@/features/pricing/ui/PricingPlanAction";
import {
  formatPricingAmount,
  formatSubscriptionDate,
} from "@/features/pricing/service/pricingFormatters";
import {
  hasRemainingCanceledProPeriod,
  isActiveProSubscription,
  useMySubscription,
  useSubscriptionActions,
} from "@/features/subscription";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { ApiError } from "@/shared/lib/apiClient";
import { DEFAULT_LOCALE, isAppLocale } from "@/shared/config/locale";
import { useSession } from "@/shared/session/useSession";

// 구독 상태에 맞는 요금제 카드 액션과 취소 흐름을 조합합니다.
export function PricingPlansSection() {
  const router = useRouter();
  const t = useTranslations("pricing");
  const currentLocale = useLocale();
  const locale = isAppLocale(currentLocale) ? currentLocale : DEFAULT_LOCALE;
  const { status } = useSession();
  const { isAuthenticated, subscription } = useMySubscription();
  const { cancelSubscription, resumeSubscription, syncSubscription } =
    useSubscriptionActions();
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
      await cancelSubscription();
      notifySuccess(t("toasts.cancelSuccess"));
      setIsCancelModalOpen(false);
      router.push("/favorites");
    } catch {
      notifyError(t("toasts.updateError"));
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (isResumingSubscription) {
      return;
    }

    setIsResumingSubscription(true);

    try {
      await resumeSubscription();
      notifySuccess(t("toasts.resumeSuccess"));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const latestSubscription = await syncSubscription().catch(() => null);

        if (isActiveProSubscription(latestSubscription)) {
          notifySuccess(t("toasts.resumeSuccess"));
          return;
        }
      }

      notifyError(t("toasts.updateError"));
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
        <PricingPlanAction disabled kind="button">
          {t("plans.currentPlan")}
        </PricingPlanAction>
      );
    }

    if (isResumeTargetPlan) {
      return (
        <PricingPlanAction
          onClick={() => {
            void handleResumeSubscription();
          }}
          disabled={isResumingSubscription}
          kind="button"
        >
          {isResumingSubscription
            ? t("subscription.resuming")
            : t("subscription.resume")}
        </PricingPlanAction>
      );
    }

    if (isAuthenticated && isFreePlan && isCurrentProPlan) {
      return (
        <PricingPlanAction
          onClick={() => setIsCancelModalOpen(true)}
          kind="button"
        >
          {t("subscription.downgrade")}
        </PricingPlanAction>
      );
    }

    const planHref =
      status !== "unauthenticated" && plan.ctaHref === "/login"
        ? "/favorites"
        : plan.ctaHref;

    return (
      <PricingPlanAction href={planHref} kind="link">
        {t(`plans.${plan.id}.cta`)}
      </PricingPlanAction>
    );
  };

  const renderPlanStatus = (plan: PricingPlan) => {
    if (!plan.highlight || (!isCurrentProPlan && !isResumableProPlan)) {
      return null;
    }

    const renewalLabel = isCurrentProPlan
      ? subscription?.autoRenew
        ? t("subscription.renewalEnabled")
        : t("subscription.renewalDisabled")
      : t("subscription.renewalStopped");
    const billingDateLabel = isCurrentProPlan
      ? t("subscription.nextBillingAt")
      : t("subscription.currentPeriodEnd");
    const billingDateValue = isCurrentProPlan
      ? subscription?.nextBillingAt
      : subscription?.currentPeriodEnd;

    return (
      <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
        <p className="font-semibold">{t("subscription.currentPro")}</p>
        <p className="mt-1 text-[var(--pricing-featured-text)]">
          {renewalLabel}
        </p>
        <p className="mt-1 text-[var(--pricing-featured-text)]">
          {t("subscription.date", {
            label: billingDateLabel,
            value: formatSubscriptionDate(
              billingDateValue ?? null,
              locale,
              t("subscription.emptyValue"),
            ),
          })}
        </p>
      </div>
    );
  };

  const getPlanContent = (plan: PricingPlan): PricingPlanContent => ({
    badge: t(`plans.${plan.id}.badge`),
    billingNote: t(`plans.${plan.id}.billingNote`),
    description: t(`plans.${plan.id}.description`),
    features: plan.featureIds.map((featureId) =>
      t(`plans.${plan.id}.features.${featureId}`),
    ),
    name: t(`plans.${plan.id}.name`),
    price: formatPricingAmount(plan.price, locale),
    priceSuffix: t(`plans.${plan.id}.priceSuffix`),
  });

  return (
    <>
      <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 lg:mt-16 lg:grid-cols-[0.95fr_1.05fr]">
        {PRICING_PLANS.map((plan) => (
          <PricingPlanCard
            key={plan.id}
            content={getPlanContent(plan)}
            plan={plan}
            recommendedLabel={t("plans.recommended")}
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
          cancelLabel={t("subscription.cancelModal.dismiss")}
          confirmLabel={t("subscription.cancelModal.confirm")}
          confirmingLabel={t("subscription.cancelModal.confirming")}
          description={t("subscription.cancelModal.description")}
          title={t("subscription.cancelModal.title")}
        />
      ) : null}
    </>
  );
}
