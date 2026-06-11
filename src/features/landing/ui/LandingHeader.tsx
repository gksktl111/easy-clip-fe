import Link from "next/link";
import {
  HiOutlineMoon,
  HiOutlinePaperClip,
  HiOutlineSun,
} from "react-icons/hi";

interface LandingHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function LandingHeader({
  isDarkMode,
  onToggleTheme,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-(--border) bg-[var(--landing-header-bg)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <HiOutlinePaperClip className="h-5 w-5" aria-hidden />
          <h1 className="text-foreground text-xl font-semibold">Easy Clip</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-all duration-500 ${
              isDarkMode
                ? "bg-amber-500/12 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.22)] hover:bg-amber-500/18"
                : "bg-sky-500/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.18)] hover:bg-sky-500/16"
            }`}
            aria-label="다크 모드 전환"
          >
            <HiOutlineSun
              className={`absolute h-5 w-5 transition-all duration-500 ${
                isDarkMode
                  ? "scale-100 rotate-0 text-amber-300 opacity-100"
                  : "scale-50 -rotate-90 text-amber-200 opacity-0"
              }`}
            />
            <HiOutlineMoon
              className={`absolute h-5 w-5 transition-all duration-500 ${
                isDarkMode
                  ? "scale-50 rotate-90 text-sky-200 opacity-0"
                  : "scale-100 rotate-0 text-sky-500 opacity-100"
              }`}
            />
          </button>

          <Link
            href="/login"
            className="rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-(--primary-hover)"
          >
            <span className="text-primary-foreground">시작하기</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
