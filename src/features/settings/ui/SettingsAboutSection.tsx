"use client";

import { useTranslations } from "next-intl";
import { HiOutlineCreditCard } from "react-icons/hi";
import {
  mapSubscriptionStatus,
  type MySubscriptionResponseDto,
  type SubscriptionStatus,
} from "@/features/subscription";
import type { AppLocale } from "@/shared/config/locale";
import { Text } from "@/shared/ui/typography/Text";

// 앱 소개와 현재 구독의 플랜, 상태, 결제 예정 정보를 함께 표시합니다.
interface SettingsAboutSectionProps {
  errorMessage: string | null;
  isLoading: boolean;
  language: AppLocale;
  subscription: MySubscriptionResponseDto | null | undefined;
}

function SubscriptionStatusLabel({
  status,
  language,
}: {
  status: SubscriptionStatus;
  language: AppLocale;
}) {
  const t = useTranslations("settings");

  switch (status.kind) {
    case "free":
      return t("subscriptionFreeStatus");
    case "active":
      return t("subscriptionStatusValues.ACTIVE");
    case "canceled":
      return t("subscriptionCanceledUntil", {
        date: new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(status.currentPeriodEnd)),
      });
    case "unavailable":
      return t("subscriptionUnavailableStatus");
  }
}

export function SettingsAboutSection({
  errorMessage,
  isLoading,
  language,
  subscription,
}: SettingsAboutSectionProps) {
  const t = useTranslations("settings");

  const formatNullableDate = (value: string | null) => {
    if (!value) {
      return t("subscriptionEmptyValue");
    }

    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const mappedStatus = mapSubscriptionStatus(subscription);
  const hasScheduledBilling =
    !isLoading &&
    mappedStatus.kind === "active" &&
    mappedStatus.nextBillingAt !== null;

  return (
    <section>
      <Text variant="sectionLabel">{t("about")}</Text>
      <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
        <Text variant="itemTitle">{t("aboutTitle")}</Text>
        <Text variant="caption">{t("aboutDescription")}</Text>
      </div>
      <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center text-(--muted)">
            <HiOutlineCreditCard className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <Text variant="itemTitle" className="text-left">
              {t("subscriptionTitle")}
            </Text>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
              <div>
                <Text as="dt" variant="caption">
                  {t("subscriptionPlan")}
                </Text>
                <dd className="mt-1 font-semibold">
                  {isLoading
                    ? t("subscriptionLoading")
                    : (mappedStatus.plan ?? t("subscriptionEmptyValue"))}
                </dd>
              </div>
              <div>
                <Text as="dt" variant="caption">
                  {t("subscriptionStatus")}
                </Text>
                <dd className="mt-1 font-semibold">
                  {isLoading ? (
                    t("subscriptionLoading")
                  ) : (
                    <SubscriptionStatusLabel
                      status={mappedStatus}
                      language={language}
                    />
                  )}
                </dd>
              </div>
              {hasScheduledBilling ? (
                <div>
                  <Text as="dt" variant="caption">
                    {t("subscriptionNextBillingAt")}
                  </Text>
                  <dd className="mt-1 font-semibold">
                    {formatNullableDate(mappedStatus.nextBillingAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
            {errorMessage ? (
              <Text variant="caption" className="mt-3">
                {errorMessage}
              </Text>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
