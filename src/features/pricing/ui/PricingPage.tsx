import { PricingComparisonSection } from "@/features/pricing/ui/PricingComparisonSection";
import { PricingHeroSection } from "@/features/pricing/ui/PricingHeroSection";
import { PricingPlansSection } from "@/features/pricing/ui/PricingPlansSection";

// 요금제 소개, 플랜 선택과 비교 섹션을 조합합니다.
export function PricingPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col px-6 pt-20 pb-24">
        <PricingHeroSection />
        <PricingPlansSection />
        <PricingComparisonSection />
      </div>
    </section>
  );
}
