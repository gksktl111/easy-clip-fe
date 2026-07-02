"use client";

import { useTranslations } from "next-intl";
import { HiOutlineRefresh, HiOutlineTrash } from "react-icons/hi";

interface TrashPageHeaderProps {
  count: number;
  isLoading?: boolean;
  isClearingAll?: boolean;
  onReload: () => void;
  onRequestClearAll: () => void;
}

// 휴지통 페이지 상단에서 현재 페이지 목적을 짧게 안내하는 헤더 컴포넌트입니다.
export function TrashPageHeader({
  count,
  isLoading = false,
  isClearingAll = false,
  onReload,
  onRequestClearAll,
}: TrashPageHeaderProps) {
  const t = useTranslations("trash");

  return (
    <div className="border-b border-(--border) px-4 py-6 min-[1200px]:px-6">
      <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-(--foreground)">
              {t("title")}
            </h1>
            <span className="rounded-full bg-(--surface-muted) px-2.5 py-1 text-xs font-medium text-(--muted)">
              {t("retentionNotice")}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-3">
            <p className="text-sm text-(--muted)">{t("description")}</p>
            <span className="text-sm font-medium text-(--foreground)">
              {isLoading
                ? t("loading")
                : isClearingAll
                  ? t("clearing")
                  : t("totalCount", { count })}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={isLoading || count === 0 || isClearingAll}
            onClick={onRequestClearAll}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-medium text-red-500 transition-colors duration-150 ease-out hover:bg-red-500/10 disabled:cursor-default disabled:opacity-45"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden />
            {isClearingAll ? t("clearingAction") : t("clearAll")}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onReload}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-(--border) text-(--foreground) transition-colors duration-150 ease-out hover:bg-(--surface-muted) disabled:cursor-default disabled:opacity-45"
            aria-label={t("refresh")}
            title={t("refresh")}
          >
            <HiOutlineRefresh className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
