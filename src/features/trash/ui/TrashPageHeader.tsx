"use client";

import { useTranslations } from "next-intl";

// 휴지통 페이지 상단에서 현재 페이지 목적을 짧게 안내하는 헤더 컴포넌트입니다.
export function TrashPageHeader() {
  const t = useTranslations("trash");

  return (
    <div className="border-b border-(--border) px-4 py-6 min-[1200px]:px-6">
      <div className="flex flex-col gap-3 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
        <p className="text-sm text-(--muted)">{t("description")}</p>
      </div>
    </div>
  );
}
