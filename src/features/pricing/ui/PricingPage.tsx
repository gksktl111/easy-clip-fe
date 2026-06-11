import Link from "next/link";
import { HiCheck, HiOutlineSparkles } from "react-icons/hi";
import {
  PRICING_COMPARISON_POINTS,
  PRICING_PLANS,
} from "@/features/pricing/const/pricingContent";

export function PricingPage() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[28rem]"
        style={{
          backgroundImage:
            "var(--pricing-hero-glow), var(--pricing-hero-fade)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-(--muted) backdrop-blur-sm"
            style={{
              backgroundColor: "var(--pricing-chip-bg)",
              border: "1px solid var(--pricing-chip-border)",
            }}
          >
            <HiOutlineSparkles className="h-4 w-4" />
            <span>Simple plans for focused teams</span>
          </div>

          <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            작업 방식에 맞는
            <br />
            EasyClip 플랜을 선택하세요.
          </h1>

          <p className="mt-6 text-lg leading-8 text-(--muted)">
            OpenAI의 요금제 페이지처럼 정보 계층이 분명한 카드 레이아웃을
            참고해, 빠르게 비교하고 바로 선택할 수 있는 첫 버전으로
            구성했습니다.
          </p>
        </div>

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
                <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
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
                href="/login"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-(--primary) text-primary-foreground hover:bg-(--primary-hover)"
                }`}
              >
                {plan.ctaLabel}
              </Link>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        plan.highlight
                          ? "bg-white/12 text-white"
                          : ""
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

        <section
          className="mt-8 rounded-[2rem] border border-(--border) bg-(--surface) p-6"
          style={{ boxShadow: "var(--pricing-compare-shadow)" }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-(--muted)">Quick comparison</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                핵심 차이만 먼저 비교할 수 있도록 정리했습니다.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-(--muted)">
              첫 버전은 프로젝트 수, 클립 생성 한도, 정리 기능 차이를 중심으로
              비교합니다. 이후 세부 제한과 팀 플랜은 확장 가능합니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PRICING_COMPARISON_POINTS.map((point) => (
              <div
                key={point.label}
                className="rounded-3xl border border-(--border) bg-[var(--landing-demo-surface)] p-5"
              >
                <p className="text-sm font-medium text-(--muted)">{point.label}</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-(--muted) uppercase">
                      Free
                    </p>
                    <p className="mt-1 text-lg font-semibold">{point.freeValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-(--muted) uppercase">
                      Pro
                    </p>
                    <p
                      className="mt-1 text-lg font-semibold"
                      style={{ color: "var(--pricing-accent)" }}
                    >
                      {point.proValue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
