import { describe, expect, it } from "vitest";
import {
  formatPricingAmount,
  formatSubscriptionDate,
} from "@/features/pricing/service/pricingFormatters";
import type { AppLocale } from "@/shared/config/locale";

const pricingLocales: readonly AppLocale[] = ["ko", "en", "ja", "zh"];
const subscriptionDate = "2026-08-14T03:04:00.000Z";

describe("pricingFormatters", () => {
  it.each(pricingLocales)("%s 로케일의 통화 형식을 사용한다", (locale) => {
    const expected = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(3_900);

    expect(formatPricingAmount(3_900, locale)).toBe(expected);
  });

  it.each(pricingLocales)("%s 로케일의 날짜 형식을 사용한다", (locale) => {
    const expected = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(subscriptionDate));

    expect(formatSubscriptionDate(subscriptionDate, locale, "-")).toBe(
      expected,
    );
  });

  it("없거나 올바르지 않은 날짜에는 대체 문구를 반환한다", () => {
    expect(formatSubscriptionDate(null, "ko", "-")).toBe("-");
    expect(formatSubscriptionDate("not-a-date", "ko", "-")).toBe("-");
  });
});
