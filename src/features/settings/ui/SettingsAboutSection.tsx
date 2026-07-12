"use client";

import { useTranslations } from "next-intl";
import { HiOutlineCreditCard } from "react-icons/hi";
import type { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";
import type { AppLocale } from "@/shared/config/locale";
import { Text } from "@/shared/ui/typography/Text";

// 앱 소개와 현재 구독의 플랜, 상태, 결제 예정 정보를 함께 표시합니다.
interface SettingsAboutSectionProps {
  errorMessage: string | null;
  isLoading: boolean;
  language: AppLocale;
  subscription: MySubscriptionResponseDto | null | undefined;
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

  const formatSubscriptionStatus = (
    status: MySubscriptionResponseDto["status"] | null | undefined,
  ) => {
    if (!status) {
      return t("subscriptionEmptyValue");
    }

    return t(`subscriptionStatusValues.${status}`);
  };

  return (
    <section>
      <Text variant="sectionLabel">{t("about")}</Text>
      <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
        <Text variant="itemTitle">{t("aboutTitle")}</Text>
        <Text variant="caption">{t("aboutDescription")}</Text>
      </div>
      <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
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
                    : (subscription?.plan ?? t("subscriptionEmptyValue"))}
                </dd>
              </div>
              <div>
                <Text as="dt" variant="caption">
                  {t("subscriptionStatus")}
                </Text>
                <dd className="mt-1 font-semibold">
                  {isLoading
                    ? t("subscriptionLoading")
                    : formatSubscriptionStatus(subscription?.status)}
                </dd>
              </div>
              <div>
                <Text as="dt" variant="caption">
                  {t("subscriptionNextBillingAt")}
                </Text>
                <dd className="mt-1 font-semibold">
                  {formatNullableDate(subscription?.nextBillingAt ?? null)}
                </dd>
              </div>
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
