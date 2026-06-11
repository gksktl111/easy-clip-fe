"use client";

import { LandingFeaturesSection } from "@/features/landing/ui/LandingFeaturesSection";
import { LandingFinalCtaSection } from "@/features/landing/ui/LandingFinalCtaSection";
import { LandingHeroSection } from "@/features/landing/ui/LandingHeroSection";
import { MarketingShell } from "@/features/landing/ui/MarketingShell";
import { LandingReviewsBanner } from "@/features/landing/ui/LandingReviewsBanner";
import { LandingWorkflowSection } from "@/features/landing/ui/LandingWorkflowSection";
import {
  LANDING_DEMO_ITEMS,
  LANDING_FEATURES,
  LANDING_MOBILE_DEMO_ITEMS,
  LANDING_REVIEWS,
  LANDING_WORKFLOW_STEPS,
} from "../const/landingContent";

export function LandingPage() {
  return (
    <MarketingShell activeTab="home">
      <LandingHeroSection
        demoItems={LANDING_DEMO_ITEMS}
        mobileDemoItems={LANDING_MOBILE_DEMO_ITEMS}
      />
      <LandingWorkflowSection steps={LANDING_WORKFLOW_STEPS} />
      <LandingFeaturesSection features={LANDING_FEATURES} />
      <LandingReviewsBanner reviews={LANDING_REVIEWS} />
      <LandingFinalCtaSection />
    </MarketingShell>
  );
}
