import { MarketingShell } from "@/features/landing/ui/MarketingShell";
import { PricingPage } from "@/features/pricing/ui/PricingPage";

export default function Pricing() {
  return (
    <MarketingShell activeTab="pricing">
      <PricingPage />
    </MarketingShell>
  );
}
