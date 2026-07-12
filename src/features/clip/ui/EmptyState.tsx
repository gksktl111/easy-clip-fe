"use client";

import { useTranslations } from "next-intl";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { EmptyStateCard } from "@/shared/ui/empty-state/EmptyStateCard";

// 클립 목록에 표시할 항목이 없을 때 빈 상태 안내를 렌더링합니다.
export function EmptyState() {
  const t = useTranslations("clips.emptyState");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <EmptyStateCard
        icon={<HiOutlineClipboardCopy className="h-7 w-7" aria-hidden />}
        title={t("title")}
        description={t("description")}
      />
    </div>
  );
}
