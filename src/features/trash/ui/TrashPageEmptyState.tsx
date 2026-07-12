"use client";

import { useTranslations } from "next-intl";
import { HiOutlineTrash } from "react-icons/hi";
import { EmptyStateCard } from "@/shared/ui/empty-state/EmptyStateCard";

// 휴지통에 표시할 항목이 없을 때 비어 있는 상태를 안내하는 컴포넌트입니다.
export function TrashPageEmptyState() {
  const t = useTranslations("trash");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <EmptyStateCard
        icon={<HiOutlineTrash className="h-7 w-7" aria-hidden />}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    </div>
  );
}
