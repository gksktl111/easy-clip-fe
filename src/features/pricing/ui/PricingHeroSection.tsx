"use client";

import { useTranslations } from "next-intl";

// 요금제 페이지의 목적과 선택 안내를 첫 영역에 표시합니다.
export function PricingHeroSection() {
  const t = useTranslations("pricing.hero");

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance break-keep-ko md:text-6xl">
        {t("titleLine1")}
        <br />
        {t("titleLine2")}
      </h1>
    </div>
  );
}
