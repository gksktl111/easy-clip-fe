import type { AppLocale } from "@/shared/config/locale";

// 선택 언어에 맞춰 금액과 구독 일시를 일관되게 표시합니다.
export const formatPricingAmount = (amount: number, locale: AppLocale) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatSubscriptionDate = (
  value: string | null,
  locale: AppLocale,
  emptyValue: string,
) => {
  if (!value) {
    return emptyValue;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return emptyValue;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
