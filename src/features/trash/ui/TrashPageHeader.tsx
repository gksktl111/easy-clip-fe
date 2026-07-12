"use client";

import { useTranslations } from "next-intl";
import { HiOutlineRefresh, HiOutlineReply, HiOutlineTrash } from "react-icons/hi";
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

  return (
    <div className="border-b border-(--border) px-4 py-6 min-[1200px]:px-6">
      <div className="flex flex-col gap-4 min-[1200px]:flex-row min-[1200px]:items-start min-[1200px]:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text as="h1" variant="pageTitle">
              {t("title")}
            </Text>
            <Badge variant="muted" className="font-medium">
              {t("retentionNotice")}
            </Badge>
          </div>
          <div className="mt-2 flex flex-col gap-1 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-3">
            <Text variant="bodyMuted">{t("description")}</Text>
            {isLoading ||
            isRestoringSelected ||
            isDeletingSelected ||
            isClearingAll ||
            hasSelection ? (
              <Text as="span" variant="bodyStrong">
                {isLoading
                  ? t("loading")
                  : isRestoringSelected
                    ? t("restoringSelected")
                    : isDeletingSelected
                      ? t("deletingSelected")
                      : isClearingAll
                        ? t("clearing")
                        : t("selectedCount", { count: selectedCount })}
              </Text>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col items-end gap-4 min-[520px]:w-auto min-[520px]:shrink-0">
          <div className="flex w-full flex-wrap justify-end gap-2 min-[520px]:w-auto min-[520px]:items-center">
            {hasSelection ? (
              <>
                <Button
                  disabled={
                    areControlsDisabled ||
                    isRestoringSelected ||
                    isDeletingSelected ||
                    isClearingAll
                  }
                  onClick={onRestoreSelected}
                  variant="primary"
                  size="md"
                  className="min-w-0 flex-1 text-white hover:opacity-90 disabled:opacity-45 min-[520px]:flex-none"
                >
                  <HiOutlineReply className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">
                    {isRestoringSelected
                      ? t("restoringSelectedAction")
                      : t("restoreSelected")}
                  </span>
                </Button>
                <Button
                  disabled={
                    areControlsDisabled ||
                    isRestoringSelected ||
                    isDeletingSelected ||
                    isClearingAll
                  }
                  onClick={onRequestDeleteSelected}
                  variant="danger"
                  size="md"
                  className="min-w-0 flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-45 min-[520px]:flex-none"
                >
                  <HiOutlineTrash className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">
                    {isDeletingSelected
                      ? t("deletingSelectedAction")
                      : t("deleteSelected")}
                  </span>
                </Button>
              </>
            ) : null}
            <Button
              disabled={
                areControlsDisabled ||
                count === 0 ||
                isClearingAll ||
                isRestoringSelected ||
                isDeletingSelected
              }
              onClick={onRequestClearAll}
              variant="dangerOutline"
              size="md"
              className="min-w-0 flex-1 disabled:opacity-45 min-[520px]:flex-none"
            >
              <HiOutlineTrash className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">
                {isClearingAll ? t("clearingAction") : t("clearAll")}
              </span>
            </Button>
            <Button
              disabled={areControlsDisabled}
              onClick={onReload}
              variant="secondary"
              size="icon"
              className="shrink-0 disabled:opacity-45"
              aria-label={t("refresh")}
              title={t("refresh")}
            >
              <HiOutlineRefresh className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          {!isLoading ? (
            <Badge variant="mutedStrong" size="md">
              {t("totalCount", { count })}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
