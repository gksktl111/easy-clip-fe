"use client";

import { useTranslations } from "next-intl";
import { PRICING_COMPARISON_POINT_IDS } from "@/features/pricing/const/pricingContent";

// Free와 Pro 플랜의 핵심 차이를 접근 가능한 표로 비교합니다.
export function PricingComparisonSection() {
  const t = useTranslations("pricing.comparison");

  return (
    <section
      className="mt-8 rounded-[2rem] border border-(--border) bg-(--surface) p-6"
      style={{ boxShadow: "var(--pricing-compare-shadow)" }}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-(--muted)">{t("eyebrow")}</p>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="max-w-2xl text-sm leading-6 text-(--muted)">
          {t("description")}
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-(--border)">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[var(--landing-demo-surface)] text-left">
                <th className="px-5 py-4 text-sm font-semibold text-(--foreground)">
                  {t("columns.feature")}
                </th>
                <th className="border-l border-(--border) px-5 py-4 text-sm font-semibold text-(--foreground)">
                  {t("columns.free")}
                </th>
                <th className="border-l border-(--border) px-5 py-4 text-sm font-semibold">
                  <span style={{ color: "var(--pricing-accent)" }}>
                    {t("columns.pro")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARISON_POINT_IDS.map((point, index) => (
                <tr
                  key={point}
                  className={
                    index % 2 === 0
                      ? "bg-(--surface)"
                      : "bg-[var(--landing-demo-surface)]"
                  }
                >
                  <th className="border-t border-(--border) px-5 py-4 text-left text-sm font-medium text-(--foreground)">
                    {t(`points.${point}.label`)}
                  </th>
                  <td className="border-t border-l border-(--border) px-5 py-4 text-sm text-(--muted)">
                    {t(`points.${point}.freeValue`)}
                  </td>
                  <td className="border-t border-l border-(--border) px-5 py-4 text-sm font-medium">
                    <span style={{ color: "var(--pricing-accent)" }}>
                      {t(`points.${point}.proValue`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
