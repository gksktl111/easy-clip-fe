import { UserSettingsSync } from "@/app/_components/UserSettingsSync";
import { AuthBootstrap } from "@/features/auth";
import { MarketingShell } from "@/features/landing";
import { PricingPage } from "@/features/pricing";

export default function Pricing() {
  return (
    <>
      <AuthBootstrap />
      <UserSettingsSync />
      <MarketingShell activeTab="pricing">
        <PricingPage />
      </MarketingShell>
    </>
  );
}
