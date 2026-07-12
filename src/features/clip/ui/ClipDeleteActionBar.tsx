"use client";

import { useTranslations } from "next-intl";
import { HiOutlineTrash, HiX } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";

interface ClipDeleteActionBarProps {
  selectedCount: number;
  totalCount: number;
  isDeleting?: boolean;
  onCancel: () => void;
  onDeleteSelected: () => void;
  onRequestDeleteAll: () => void;
}

export function ClipDeleteActionBar({
  selectedCount,
  totalCount,
  isDeleting = false,
  onCancel,
  onDeleteSelected,
  onRequestDeleteAll,
}: ClipDeleteActionBarProps) {
  const t = useTranslations("clips.deleteMode");
  const hasSelection = selectedCount > 0;

  return (
    <div className="absolute inset-x-4 bottom-4 z-30 flex justify-center md:inset-x-6 md:bottom-6">
      <div className="flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-(--border) bg-(--surface-elevated) p-3 shadow-xl shadow-black/10 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-(--foreground)">
            {t("title")}
          </p>
          <p className="mt-1 text-xs text-(--muted)">
            {t("selectedCount", { selectedCount, totalCount })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 min-[520px]:flex min-[520px]:items-center min-[760px]:shrink-0">
          <Button
            disabled={isDeleting}
            onClick={onCancel}
            variant="secondary"
            size="md"
          >
            <HiX className="h-4 w-4" aria-hidden />
            {t("cancel")}
          </Button>
          <Button
            disabled={isDeleting || !hasSelection}
            onClick={onDeleteSelected}
            variant="danger"
            size="md"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden />
            {isDeleting ? t("deleting") : t("deleteSelected")}
          </Button>
          <Button
            disabled={isDeleting || totalCount === 0}
            onClick={onRequestDeleteAll}
            variant="dangerOutline"
            size="md"
            className="col-span-2 min-[520px]:col-span-1"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden />
            {t("deleteAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
