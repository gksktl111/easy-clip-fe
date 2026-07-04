"use client";

import { useTranslations } from "next-intl";
import { HiOutlineTrash, HiX } from "react-icons/hi";

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
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--border) px-3 text-sm font-medium text-(--foreground) transition hover:bg-(--surface-muted) disabled:cursor-default disabled:opacity-50"
          >
            <HiX className="h-4 w-4" aria-hidden />
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={isDeleting || !hasSelection}
            onClick={onDeleteSelected}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--danger) px-3 text-sm font-medium text-danger-foreground transition hover:bg-(--danger-hover) disabled:cursor-default disabled:opacity-50"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden />
            {isDeleting ? t("deleting") : t("deleteSelected")}
          </button>
          <button
            type="button"
            disabled={isDeleting || totalCount === 0}
            onClick={onRequestDeleteAll}
            className="col-span-2 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-medium text-(--danger) transition hover:bg-red-500/10 disabled:cursor-default disabled:opacity-50 min-[520px]:col-span-1"
          >
            <HiOutlineTrash className="h-4 w-4" aria-hidden />
            {t("deleteAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
