"use client";

import { useTranslations } from "next-intl";

import { useBillingAuthFlow } from "@/features/subscription/hooks/useBillingAuthFlow";
import { BillingCheckoutCard } from "@/features/subscription/ui/BillingCheckoutCard";
import { BillingHeroSection } from "@/features/subscription/ui/BillingHeroSection";

// 구독 상태를 확인하고 Toss 카드 인증 진입과 오류 복구 UI를 조합합니다.
export function BillingPage() {
  const { startBilling, step } = useBillingAuthFlow();
  const t = useTranslations("billing");

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-5 px-4 py-6">
        <BillingHeroSection />
        <BillingCheckoutCard
          actionLabel={
            step === "loading"
              ? t("loading")
              : step === "redirecting"
                ? t("redirecting")
                : t("start")
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
