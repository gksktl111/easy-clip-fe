"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineRefresh,
  HiOutlineReply,
  HiOutlineTrash,
} from "react-icons/hi";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { Text } from "@/shared/ui/typography/Text";

interface TrashPageHeaderProps {
  count: number;
  selectedCount?: number;
  isLoading?: boolean;
  isActionPending?: boolean;
  isClearingAll?: boolean;
  isRestoringSelected?: boolean;
  isDeletingSelected?: boolean;
  onReload: () => void;
  onRequestClearAll: () => void;
  onRestoreSelected: () => void;
  onRequestDeleteSelected: () => void;
}

// 휴지통 페이지 상단에서 현재 페이지 목적을 짧게 안내하는 헤더 컴포넌트입니다.
export function TrashPageHeader({
  count,
  selectedCount = 0,
  isLoading = false,
  isActionPending = false,
  isClearingAll = false,
  isRestoringSelected = false,
  isDeletingSelected = false,
  onReload,
  onRequestClearAll,
  onRestoreSelected,
  onRequestDeleteSelected,
}: TrashPageHeaderProps) {
  const t = useTranslations("trash");
  const hasSelection = selectedCount > 0;
  const areControlsDisabled = isLoading || isActionPending;
  const statusLabel = isLoading
    ? t("loading")
    : isRestoringSelected
      ? t("restoringSelected")
      : isDeletingSelected
        ? t("deletingSelected")
        : isClearingAll
          ? t("clearing")
          : hasSelection
            ? t("selectedCount", { count: selectedCount })
            : null;

  return (
    <header className="border-b border-(--border) px-4 py-5 min-[1200px]:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Text as="h1" variant="pageTitle">
              {t("title")}
            </Text>
            {!isLoading ? (
              <Badge variant="muted">{t("totalCount", { count })}</Badge>
            ) : null}
          </div>
          <Text variant="bodyMuted" className="mt-2">
            {t("description")}
          </Text>
          <Text variant="caption" className="mt-1">
            {t("retentionNotice")}
          </Text>
        </div>
        <Button
          disabled={areControlsDisabled}
          onClick={onReload}
          variant="secondarySurface"
          size="icon"
          className="shrink-0"
          aria-label={t("refresh")}
          title={t("refresh")}
        >
          <HiOutlineRefresh className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--border) pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span role="status" className="text-sm text-(--muted)">
            {statusLabel ?? t("selectionHint")}
          </span>
          {hasSelection ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={areControlsDisabled}
                onClick={onRestoreSelected}
                variant="primary"
                size="sm"
              >
                <HiOutlineReply className="h-4 w-4" aria-hidden />
                {isRestoringSelected
                  ? t("restoringSelectedAction")
                  : t("restoreSelected")}
              </Button>
              <Button
                disabled={areControlsDisabled}
                onClick={onRequestDeleteSelected}
                variant="dangerOutline"
                size="sm"
              >
                <HiOutlineTrash className="h-4 w-4" aria-hidden />
                {isDeletingSelected
                  ? t("deletingSelectedAction")
                  : t("deleteSelected")}
              </Button>
            </div>
          ) : null}
        </div>
        <Button
          disabled={areControlsDisabled}
          onClick={onRequestClearAll}
          variant="dangerOutline"
          size="sm"
        >
          <HiOutlineTrash className="h-4 w-4" aria-hidden />
          {isClearingAll ? t("clearingAction") : t("clearAll")}
        </Button>
      </div>
    </header>
  );
}
