import { PRICING_COMPARISON_POINTS } from "@/features/pricing/const/pricingContent";

// Free와 Pro 플랜의 핵심 차이를 접근 가능한 표로 비교합니다.
export function PricingComparisonSection() {
  return (
    <section
      className="mt-8 rounded-[2rem] border border-(--border) bg-(--surface) p-6"
      style={{ boxShadow: "var(--pricing-compare-shadow)" }}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-(--muted)">Quick comparison</p>
        <h2 className="text-2xl font-semibold tracking-tight">핵심 비교</h2>
        <p className="max-w-2xl text-sm leading-6 text-(--muted)">
          주요 차이를 표로 정리했습니다. 다른 요금제 페이지처럼 항목별로 바로
          비교할 수 있도록 구성했습니다.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-(--border)">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[var(--landing-demo-surface)] text-left">
                <th className="px-5 py-4 text-sm font-semibold text-(--foreground)">
                  항목
                </th>
                <th className="border-l border-(--border) px-5 py-4 text-sm font-semibold text-(--foreground)">
                  Free
                </th>
                <th className="border-l border-(--border) px-5 py-4 text-sm font-semibold">
                  <span style={{ color: "var(--pricing-accent)" }}>Pro</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARISON_POINTS.map((point, index) => (
                <tr
                  key={point.label}
                  className={
                    index % 2 === 0
                      ? "bg-(--surface)"
                      : "bg-[var(--landing-demo-surface)]"
                  }
                >
                  <th className="border-t border-(--border) px-5 py-4 text-left text-sm font-medium text-(--foreground)">
                    {point.label}
                  </th>
                  <td className="border-t border-l border-(--border) px-5 py-4 text-sm text-(--muted)">
                    {point.freeValue}
                  </td>
                  <td className="border-t border-l border-(--border) px-5 py-4 text-sm font-medium">
                    <span style={{ color: "var(--pricing-accent)" }}>
                      {point.proValue}
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
