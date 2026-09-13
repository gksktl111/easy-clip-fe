"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

// 권한 확인 전에는 각 화면의 빈 목록 형태만 표시하고 실제 자료는 렌더링하지 않습니다.
export function ResourceAccessLoading({ children }: { children: ReactNode }) {
  const t = useTranslations("access");
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden"
      role="status"
      aria-label={t("checkingTitle")}
      aria-busy="true"
    >
      {children}
    </div>
  );
}
