"use client";

import { useTranslations } from "next-intl";
import { HiOutlineTrash } from "react-icons/hi";

// 휴지통에 표시할 항목이 없을 때 비어 있는 상태를 안내하는 컴포넌트입니다.
export function TrashPageEmptyState() {
  const t = useTranslations("trash");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="flex max-w-sm flex-col items-center rounded-3xl border border-dashed border-(--border) bg-(--surface) px-8 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--icon-chip) text-(--icon-chip-text)">
          <HiOutlineTrash className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-5 text-base font-semibold text-(--foreground)">
          {t("emptyTitle")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-(--muted)">
          {t("emptyDescription")}
        </p>
      </div>
    </div>
  );
}
