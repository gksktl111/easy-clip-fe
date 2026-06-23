import Link from "next/link";
import { HiCheck } from "react-icons/hi";
import { PRICING_PLANS } from "@/features/pricing/const/pricingContent";

export function PricingPlansSection() {
  return (
    <div className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      {PRICING_PLANS.map((plan) => (
        <article
          key={plan.name}
          className={`relative overflow-hidden rounded-[2rem] border px-8 py-8 transition-transform duration-300 hover:-translate-y-1 ${
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
              <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
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
            className={`mt-5 text-base leading-7 ${
              plan.highlight
                ? "text-[var(--pricing-featured-text)]"
                : "text-(--muted)"
            }`}
          >
            {plan.description}
          </p>

          <div className="mt-8 flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-tight">
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
      ))}
    </div>
  );
}
