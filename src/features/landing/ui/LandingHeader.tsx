import Link from "next/link";
import {
  HiOutlineMoon,
  HiOutlinePaperClip,
  HiOutlineSun,
} from "react-icons/hi";

export type LandingHeaderTab = "home" | "pricing";

// 마케팅 페이지의 브랜드 탐색, 요금제 이동, 테마 전환 액션을 제공합니다.
interface LandingHeaderProps {
  activeTab?: LandingHeaderTab;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function LandingHeader({
  activeTab = "home",
  isDarkMode,
  onToggleTheme,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-(--border) bg-[var(--landing-header-bg)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <HiOutlinePaperClip className="h-5 w-5" aria-hidden />
          <span className="text-foreground text-xl font-semibold">
            Easy Clip
          </span>
        </Link>

        <nav
          className="order-3 flex w-full justify-center md:order-2 md:w-auto"
          aria-label="랜딩 페이지 탐색"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center px-1 py-2 text-sm font-medium transition-colors"
            aria-current={activeTab === "pricing" ? "page" : undefined}
          >
            <span
              className={`${
                activeTab === "pricing"
                  ? "border-(--foreground) text-(--foreground)"
                  : "border-transparent text-(--muted) hover:text-(--foreground)"
              }`}
            >
              요금제
            </span>
          </Link>
        </nav>

        <div className="order-2 flex items-center gap-3 md:order-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-(--muted) transition-colors hover:bg-(--surface-muted) hover:text-(--foreground)"
            aria-label="다크 모드 전환"
          >
            {isDarkMode ? (
              <HiOutlineSun className="h-5 w-5" aria-hidden />
            ) : (
              <HiOutlineMoon className="h-5 w-5" aria-hidden />
            )}
          </button>

          <Link
            href="/login"
            className="rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-(--primary-hover)"
          >
            <span className="text-(--primary-foreground)">시작하기</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
