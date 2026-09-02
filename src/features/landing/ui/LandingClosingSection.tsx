interface LandingClosingSectionProps {
  titleLine1: string;
  titleLine2: string;
  description: string;
}

// 랜딩 페이지 마지막에서 제품 가치를 한 번 더 요약합니다.
export function LandingClosingSection({
  titleLine1,
  titleLine2,
  description,
}: LandingClosingSectionProps) {
  return (
    <section className="border-t border-(--border) bg-[var(--landing-brand-bg)] py-24 text-[color:var(--landing-brand-fg)]">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
          {titleLine1}
          <br />
          {titleLine2}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--landing-brand-soft)] md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
