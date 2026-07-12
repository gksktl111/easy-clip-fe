import type { ReactNode } from "react";
import { HiCheck } from "react-icons/hi";
import type { PricingPlan } from "@/features/pricing/const/pricingContent";
import { Badge } from "@/shared/ui/badge/Badge";

// 요금제의 가격, 기능 목록, 현재 상태와 액션을 하나의 비교 카드로 표시합니다.
interface PricingPlanCardProps {
  action: ReactNode;
  plan: PricingPlan;
  status?: ReactNode;
}

export function PricingPlanCard({
  action,
  plan,
  status,
}: PricingPlanCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border px-5 py-6 transition-transform duration-300 hover:-translate-y-1 sm:rounded-[2rem] sm:px-8 sm:py-8 ${
        plan.highlight
          ? "border-transparent text-white"
          : "border-(--border) bg-(--surface)"
      }`}
      style={{
        boxShadow: "var(--pricing-card-shadow)",
        background: plan.highlight ? "var(--pricing-featured-bg)" : undefined,
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

      {action}
      {status}

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
              <HiCheck className="h-4 w-4" aria-hidden />
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
}
