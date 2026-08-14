export type PricingPlanId = "free" | "pro";

export type PricingPlanFeatureId =
  | "projects"
  | "clips"
  | "devices"
  | "organization"
  | "ai";

export interface PricingPlan {
  id: PricingPlanId;
  featureIds: readonly PricingPlanFeatureId[];
  price: number;
  ctaHref: string;
  highlight: boolean;
}

export type PricingComparisonPointId =
  | "projects"
  | "clips"
  | "devices"
  | "organization"
  | "ai";

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "free",
    price: 0,
    ctaHref: "/login",
    highlight: false,
    featureIds: ["projects", "clips", "devices", "organization"],
  },
  {
    id: "pro",
    price: 3_900,
    ctaHref: "/billing",
    highlight: true,
    featureIds: ["projects", "clips", "devices", "organization", "ai"],
  },
] as const;

export const PRICING_COMPARISON_POINT_IDS: readonly PricingComparisonPointId[] =
  ["projects", "clips", "devices", "organization", "ai"] as const;
