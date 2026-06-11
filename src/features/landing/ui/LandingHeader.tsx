import Link from "next/link";
import {
  HiOutlineClipboardCopy,
  HiOutlineMoon,
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
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-semibold tracking-tight">
            EasyClip
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-(--muted) transition-colors hover:bg-(--surface-muted) hover:text-(--foreground)"
            aria-label="다크 모드 전환"
          >
            {isDarkMode ? (
              <HiOutlineSun className="h-5 w-5" />
            ) : (
              <HiOutlineMoon className="h-5 w-5" />
            )}
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
