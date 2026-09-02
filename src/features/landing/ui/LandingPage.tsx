"use client";

import { useTranslations } from "next-intl";
import { LandingFeaturesSection } from "@/features/landing/ui/LandingFeaturesSection";
import { LandingClosingSection } from "@/features/landing/ui/LandingClosingSection";
import { LandingHeroSection } from "@/features/landing/ui/LandingHeroSection";
import { MarketingShell } from "@/features/landing/ui/MarketingShell";
import { LandingReviewsBanner } from "@/features/landing/ui/LandingReviewsBanner";
import { LandingWorkflowSection } from "@/features/landing/ui/LandingWorkflowSection";
import {
  LANDING_FEATURES,
  LANDING_REVIEWS,
  LANDING_WORKFLOW_STEPS,
} from "../const/landingContent";

// 랜딩 화면의 마케팅 섹션을 사용자 흐름 순서대로 조합합니다.
export function LandingPage() {
  const t = useTranslations("landing");
  const workflowSteps = LANDING_WORKFLOW_STEPS.map((step) => ({
    ...step,
    title: t(`workflow.${step.step}.title`),
    description: t(`workflow.${step.step}.description`),
  }));
  const features = LANDING_FEATURES.map((feature) => ({
    ...feature,
    title: t(`features.${feature.key}.title`),
    description: t(`features.${feature.key}.description`),
  }));

  return (
    <MarketingShell activeTab="home">
      <LandingHeroSection
        titleLine1={t("heroTitleLine1")}
        titleLine2={t("heroTitleLine2")}
        description={t("heroDescription")}
      />
      <LandingWorkflowSection
        title={t("workflowTitle")}
        description={t("workflowDescription")}
        steps={workflowSteps}
      />
      <LandingFeaturesSection
        title={t("sectionTitle")}
        description={t("sectionDescription")}
        features={features}
      />
      <LandingReviewsBanner
        title={t("reviewsTitle")}
        description={t("reviewsDescription")}
        reviews={LANDING_REVIEWS}
      />
      <LandingClosingSection
        titleLine1={t("closingTitleLine1")}
        titleLine2={t("closingTitleLine2")}
        description={t("closingDescription")}
      />
    </MarketingShell>
  );
}
