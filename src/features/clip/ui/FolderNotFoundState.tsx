"use client";

import { useTranslations } from "next-intl";
import { HiOutlineFolder } from "react-icons/hi";
import { EmptyStateCard } from "@/shared/ui/empty-state/EmptyStateCard";

// 삭제됐거나 잘못된 주소로 접근한 폴더의 전용 오류 상태를 표시합니다.
export function FolderNotFoundState() {
  const t = useTranslations("clips.folderNotFoundState");

  return (
    <div
      role="alert"
      className="bg-background flex h-full flex-1 items-center justify-center px-6 py-10"
    >
      <EmptyStateCard
        icon={<HiOutlineFolder className="h-7 w-7" aria-hidden />}
        title={t("title")}
        description={t("description")}
      />
    </div>
  );
}
