import Link from "next/link";
import { HiOutlinePlay, HiOutlineSwitchHorizontal } from "react-icons/hi";

// 핵심 가치와 진입 액션, 기기 간 동기화 데모를 첫 화면에 표시합니다.
interface LandingHeroSectionProps {
  demoItems: readonly string[];
  mobileDemoItems: readonly string[];
}

export function LandingHeroSection({
  demoItems,
  mobileDemoItems,
}: LandingHeroSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-6xl md:leading-tight">
          어디서든 복사하고.
          <br />
          어디서나 붙여넣기.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
          모든 기기에서 클립보드를 완벽하게 동기화하세요. 빠르게 움직이는
          개발자, 디자이너, 크리에이티브 팀을 위해 설계되었습니다.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-(--primary) px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-(--primary-hover)"
          >
            <span className="text-primary-foreground">무료로 시작하기</span>
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-2 rounded-xl border border-(--border) px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-(--surface-muted)"
          >
            <HiOutlinePlay className="h-4 w-4" aria-hidden />
            <span className="text-(--foreground)">데모 보기</span>
          </Link>
        </div>
      </div>

      <div className="relative mt-20 flex items-center justify-center gap-6">
        <div className="relative h-64 w-full max-w-lg overflow-hidden rounded-3xl border border-(--border) bg-[var(--landing-demo-surface)] shadow-[var(--landing-shadow)] md:h-80">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex items-center gap-2 border-b border-(--border) px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
              </div>
              <span className="ml-4 text-xs text-(--muted)">
                Easy Clip - 클립보드 관리
              </span>
            </div>

            <div className="flex-1 p-4">
              <div className="space-y-3">
                {demoItems.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-[var(--landing-demo-card)] p-3"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--landing-brand-bg)] shadow-[var(--landing-shadow)] md:static md:translate-x-0 md:translate-y-0">
          <HiOutlineSwitchHorizontal
            className="h-6 w-6 text-[var(--landing-brand-fg)]"
            aria-hidden
          />
        </div>

        <div className="hidden h-72 w-40 overflow-hidden rounded-3xl border border-(--border) bg-[var(--landing-demo-surface)] shadow-[var(--landing-shadow)] md:block">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center border-b border-(--border) py-2">
              <span className="text-xs font-medium text-(--muted)">
                Easy Clip
              </span>
            </div>

            <div className="flex-1 p-3">
              <div className="space-y-2">
                {mobileDemoItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg bg-[var(--landing-demo-card)] p-2"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                    <span className="text-[10px] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
