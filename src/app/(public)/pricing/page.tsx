import { MarketingShell } from "@/features/landing";
import { PricingPage } from "@/features/pricing";

export default function Pricing() {
  return (
    <MarketingShell activeTab="pricing">
      <PricingPage />
    </MarketingShell>
  );
}
