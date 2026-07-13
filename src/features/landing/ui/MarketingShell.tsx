"use client";

import { LandingFooter } from "@/features/landing/ui/LandingFooter";
import {
  LandingHeader,
  type LandingHeaderTab,
} from "@/features/landing/ui/LandingHeader";
import { useSession } from "@/shared/session/useSession";
import { useSettingsStore } from "@/shared/store/settingsStore";

// 마케팅 페이지에 공통 헤더, 테마 제어, 푸터를 제공하는 레이아웃입니다.
interface MarketingShellProps {
  activeTab?: LandingHeaderTab;
  children: React.ReactNode;
}

export function MarketingShell({
  activeTab = "home",
  children,
}: MarketingShellProps) {
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const { status } = useSession();
  const isDarkMode = theme === "dark";
  const currentYear = new Date().getFullYear();

  return (
    <main className="relative min-h-screen bg-(--background) text-(--foreground) transition-colors duration-300">
      <LandingHeader
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        primaryActionHref={
          status === "unauthenticated" ? "/login" : "/favorites"
        }
      />
      {children}
      <LandingFooter currentYear={currentYear} />
    </main>
  );
}
