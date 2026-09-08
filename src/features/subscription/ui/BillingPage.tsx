"use client";

import { useBillingAuthFlow } from "@/features/subscription/hooks/useBillingAuthFlow";
import { BillingCheckoutCard } from "@/features/subscription/ui/BillingCheckoutCard";
import { BillingHeroSection } from "@/features/subscription/ui/BillingHeroSection";

// 구독 상태를 확인하고 Toss 카드 인증 진입과 오류 복구 UI를 조합합니다.
export function BillingPage() {
  const { startBilling, step } = useBillingAuthFlow();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-5 px-4 py-6">
        <BillingHeroSection />
        <BillingCheckoutCard
          actionLabel={
            step === "loading"
              ? "결제 정보 준비 중"
              : step === "redirecting"
                ? "결제 인증 이동 중"
                : "카드 인증하고 Pro 시작"
          }
          onStartBilling={() => {
            void startBilling();
          }}
          step={step}
        />
      </section>
    </main>
  );
}
