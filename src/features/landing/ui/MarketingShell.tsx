"use client";

import { LandingFooter } from "@/features/landing/ui/LandingFooter";
import { LandingHeader, type LandingHeaderTab } from "@/features/landing/ui/LandingHeader";
import { useSettingsStore } from "@/shared/store/settingsStore";

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
  const isDarkMode = theme === "dark";
  const currentYear = new Date().getFullYear();

  return (
    <main className="relative min-h-screen bg-(--background) text-(--foreground) transition-colors duration-300">
      <LandingHeader isDarkMode={isDarkMode} onToggleTheme={toggleTheme} activeTab={activeTab} />
      {children}
      <LandingFooter currentYear={currentYear} />
    </main>
  );
}
