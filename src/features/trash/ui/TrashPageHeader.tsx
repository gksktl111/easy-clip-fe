"use client";

import { useTranslations } from "next-intl";
import { HiOutlineRefresh, HiOutlineTrash } from "react-icons/hi";
import { MobileHeaderPortal } from "@/shared/layout/MobileHeaderPortal";
import { Button } from "@/shared/ui/button/Button";

interface TrashPageHeaderProps {
  count: number;
  isLoading?: boolean;
  isActionPending?: boolean;
  isClearingAll?: boolean;
  onReload: () => void;
  onRequestClearAll: () => void;
}

export function TrashPageHeader({
  count,
  isLoading = false,
  isActionPending = false,
  isClearingAll = false,
  onReload,
  onRequestClearAll,
}: TrashPageHeaderProps) {
  const t = useTranslations("trash");
  const disabled = isLoading || isActionPending;
  return (
    <>
      <MobileHeaderPortal>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h1 className="text-sm font-semibold">{t("title")}</h1>
          <span className="text-xs text-(--muted)">
            {isLoading ? t("loading") : t("totalCount", { count })}
          </span>
        </div>
      </MobileHeaderPortal>
      <header className="shrink-0 border-b border-(--border) px-4 py-2 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="hidden items-baseline gap-3 md:flex">
            <h1 className="text-xl font-semibold">{t("title")}</h1>
            <span className="text-sm text-(--muted)">
              {t("totalCount", { count })}
            </span>
          </div>
          <p className="min-w-0 text-xs leading-5 text-(--muted) md:hidden">
            {t("retentionNotice")}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              disabled={disabled}
              onClick={onReload}
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label={t("refresh")}
            >
              <HiOutlineRefresh className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              disabled={disabled}
              onClick={onRequestClearAll}
              variant="ghost"
              size="sm"
              className="min-h-11 px-2 text-(--danger-text)"
            >
              <HiOutlineTrash className="h-4 w-4" aria-hidden />
              {isClearingAll ? t("clearingAction") : t("clearAll")}
            </Button>
          </div>
        </div>
        <p className="mt-1 hidden text-xs text-(--muted) md:block">
          {t("retentionNotice")}
        </p>
      </header>
    </>
  );
}
