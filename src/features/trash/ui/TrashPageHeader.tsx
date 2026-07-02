"use client";

import { useTranslations } from "next-intl";
import { HiOutlineRefresh, HiOutlineTrash } from "react-icons/hi";

interface TrashPageHeaderProps {
  count: number;
  selectedCount?: number;
  isLoading?: boolean;
  isClearingAll?: boolean;
  isDeletingSelected?: boolean;
  onReload: () => void;
  onRequestClearAll: () => void;
  onRequestDeleteSelected: () => void;
}

// 휴지통 페이지 상단에서 현재 페이지 목적을 짧게 안내하는 헤더 컴포넌트입니다.
export function TrashPageHeader({
  count,
  selectedCount = 0,
  isLoading = false,
  isClearingAll = false,
  isDeletingSelected = false,
  onReload,
  onRequestClearAll,
  onRequestDeleteSelected,
}: TrashPageHeaderProps) {
  const t = useTranslations("trash");
  const hasSelection = selectedCount > 0;

  return (
    <div className="border-b border-(--border) px-4 py-6 min-[1200px]:px-6">
      <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-start min-[1200px]:justify-between">
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
            {isLoading ||
            isDeletingSelected ||
            isClearingAll ||
            hasSelection ? (
              <span className="text-sm font-medium text-(--foreground)">
                {isLoading
                  ? t("loading")
                  : isDeletingSelected
                    ? t("deletingSelected")
                    : isClearingAll
                      ? t("clearing")
                      : t("selectedCount", { count: selectedCount })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col items-end gap-4 min-[520px]:w-auto min-[520px]:shrink-0">
          <div
            className={`grid w-full gap-2 min-[520px]:flex min-[520px]:w-auto min-[520px]:items-center ${
              hasSelection
                ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem]"
                : "grid-cols-[minmax(0,1fr)_2.5rem]"
            }`}
          >
            {hasSelection ? (
              <button
                type="button"
                disabled={isLoading || isDeletingSelected || isClearingAll}
                onClick={onRequestDeleteSelected}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 px-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-red-600 disabled:cursor-default disabled:opacity-45"
              >
                <HiOutlineTrash className="h-4 w-4" aria-hidden />
                {isDeletingSelected
                  ? t("deletingSelectedAction")
                  : t("deleteSelected")}
              </button>
            ) : null}
            <button
              type="button"
              disabled={
                isLoading || count === 0 || isClearingAll || isDeletingSelected
              }
              onClick={onRequestClearAll}
              className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-medium text-red-500 transition-colors duration-150 ease-out hover:bg-red-500/10 disabled:cursor-default disabled:opacity-45 ${
                hasSelection ? "px-2 min-[520px]:w-auto min-[520px]:px-3" : ""
              }`}
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
          {!isLoading ? (
            <span className="rounded-full bg-(--surface-muted) px-4 py-1.5 text-sm font-semibold text-(--foreground)">
              {t("totalCount", { count })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
