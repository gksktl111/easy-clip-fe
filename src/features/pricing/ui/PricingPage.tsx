import { PricingComparisonSection } from "@/features/pricing/ui/PricingComparisonSection";
import { PricingHeroSection } from "@/features/pricing/ui/PricingHeroSection";
import { PricingPlansSection } from "@/features/pricing/ui/PricingPlansSection";

export function PricingPage() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[28rem]"
        style={{
          backgroundImage: "var(--pricing-hero-glow), var(--pricing-hero-fade)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col px-6 pt-20 pb-24">
        <PricingHeroSection />
        <PricingPlansSection />
        <PricingComparisonSection />
      </div>
    </section>
  );
}
