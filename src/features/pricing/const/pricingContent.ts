import { PRO_MONTHLY_DISPLAY_AMOUNT } from "@/shared/config/planDisplay";

export type PricingPlanId = "free" | "pro";

export type PricingPlanFeatureId = "projects" | "clips" | "organization";

export interface PricingPlan {
  id: PricingPlanId;
  featureIds: readonly PricingPlanFeatureId[];
  price: number;
  ctaHref: string;
  highlight: boolean;
}

export type PricingComparisonPointId = "projects" | "clips" | "organization";

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "free",
    price: 0,
    ctaHref: "/login",
    highlight: false,
    featureIds: ["projects", "clips", "organization"],
  },
  {
    id: "pro",
    price: PRO_MONTHLY_DISPLAY_AMOUNT,
    ctaHref: "/billing",
    highlight: true,
    featureIds: ["projects", "clips", "organization"],
  },
] as const;

export const PRICING_COMPARISON_POINT_IDS: readonly PricingComparisonPointId[] =
  ["projects", "clips", "organization"] as const;
