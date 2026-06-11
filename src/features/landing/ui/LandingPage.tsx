"use client";

import { LandingFeaturesSection } from "@/features/landing/ui/LandingFeaturesSection";
import { LandingFooter } from "@/features/landing/ui/LandingFooter";
import { LandingHeader } from "@/features/landing/ui/LandingHeader";
import { LandingHeroSection } from "@/features/landing/ui/LandingHeroSection";
import { LandingReviewsBanner } from "@/features/landing/ui/LandingReviewsBanner";
import { useSettingsStore } from "@/shared/store/settingsStore";
import {
  LANDING_DEMO_ITEMS,
  LANDING_FEATURES,
  LANDING_MOBILE_DEMO_ITEMS,
  LANDING_REVIEWS,
} from "../const/landingContent";

export function LandingPage() {
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const isDarkMode = theme === "dark";
  const currentYear = new Date().getFullYear();

  return (
    <main className="relative min-h-screen overflow-y-auto bg-(--background) text-(--foreground) transition-colors duration-300">
      <LandingHeader isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <LandingHeroSection
        demoItems={LANDING_DEMO_ITEMS}
        mobileDemoItems={LANDING_MOBILE_DEMO_ITEMS}
      />
      <LandingFeaturesSection features={LANDING_FEATURES} />
      <LandingReviewsBanner reviews={LANDING_REVIEWS} />
      <LandingFooter currentYear={currentYear} />
    </main>
  );
}
