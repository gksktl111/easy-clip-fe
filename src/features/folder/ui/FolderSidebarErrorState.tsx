"use client";

import { useTranslations } from "next-intl";
import { HiOutlineRefresh } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";

interface FolderSidebarErrorStateProps {
  isRetrying?: boolean;
  onRetry?: () => void;
}

// 폴더 목록의 초기 조회 실패를 목록 영역 안에서 복구할 수 있게 표시합니다.
export function FolderSidebarErrorState({
  isRetrying = false,
  onRetry,
}: FolderSidebarErrorStateProps) {
  const t = useTranslations("sidebar");

  return (
    <li
      role="alert"
      className="mx-2 rounded-lg border border-(--border) bg-(--surface) px-3 py-3"
    >
      <p className="text-sm leading-5 text-(--muted)">{t("folderLoadError")}</p>
      {onRetry ? (
        <Button
          disabled={isRetrying}
          onClick={onRetry}
          variant="ghost"
          size="xs"
          className="mt-2 w-full"
          aria-busy={isRetrying}
        >
          <HiOutlineRefresh className="h-4 w-4" aria-hidden />
          {isRetrying ? t("retrying") : t("retry")}
        </Button>
      ) : null}
    </li>
  );
}
