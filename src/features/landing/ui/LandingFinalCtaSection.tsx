import Link from "next/link";

// 랜딩 페이지 마지막에서 로그인과 데모로 이어지는 핵심 액션을 강조합니다.
export function LandingFinalCtaSection() {
  return (
    <section className="border-t border-(--border) bg-[var(--landing-brand-bg)] py-24 text-[color:var(--landing-brand-fg)]">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
          이제 클립보드를
          <br />
          저장하고, 정리하고, 다시 쓰세요
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--landing-brand-soft)] md:text-lg">
          메신저에 나에게 보내두는 습관 대신, 작업 맥락을 유지하는 전용 공간으로
          바꾸세요. EasyClip은 복사한 순간부터 다시 꺼내 쓰는 순간까지의 흐름을
          더 짧게 만듭니다.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            <span className="text-[color:var(--landing-brand-bg)]">
              무료로 시작하기
            </span>
          </Link>
          <Link
            href="/favorites"
            className="rounded-2xl border border-white/30 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <span className="text-[color:var(--landing-brand-fg)]">
              데모 다시 보기
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
