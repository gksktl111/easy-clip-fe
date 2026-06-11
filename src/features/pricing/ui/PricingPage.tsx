import Link from "next/link";
import { HiCheck, HiOutlineSparkles } from "react-icons/hi";
import {
  PRICING_COMPARISON_POINTS,
  PRICING_PLANS,
} from "@/features/pricing/const/pricingContent";

export function PricingPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_58%),linear-gradient(180deg,_rgba(15,23,42,0.06),_transparent)]" />

      <div className="mx-auto flex max-w-6xl flex-col px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-[color:rgba(255,255,255,0.6)] px-4 py-2 text-sm text-(--muted) backdrop-blur-sm">
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
              className={`relative overflow-hidden rounded-[2rem] border px-8 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition-transform duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "border-transparent bg-[linear-gradient(145deg,#111827,#312e81)] text-white"
                  : "border-(--border) bg-(--surface)"
              }`}
            >
              {plan.highlight ? (
                <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.92),rgba(255,255,255,0))]" />
              ) : null}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      plan.highlight ? "text-indigo-200" : "text-(--muted)"
                    }`}
                  >
                    {plan.badge}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-5 text-base leading-7 ${
                  plan.highlight ? "text-slate-200" : "text-(--muted)"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
                {plan.priceSuffix ? (
                  <span
                    className={`pb-1 text-sm ${
                      plan.highlight ? "text-slate-300" : "text-(--muted)"
                    }`}
                  >
                    {plan.priceSuffix}
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-2 text-sm ${
                  plan.highlight ? "text-slate-300" : "text-(--muted)"
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
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      <HiCheck className="h-4 w-4" />
                    </span>
                    <span
                      className={`text-sm leading-6 ${
                        plan.highlight ? "text-slate-100" : "text-(--foreground)"
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

        <section className="mt-8 rounded-[2rem] border border-(--border) bg-(--surface) p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
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
                    <p className="mt-1 text-lg font-semibold text-indigo-500">
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
