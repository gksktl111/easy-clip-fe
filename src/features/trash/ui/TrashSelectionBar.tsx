"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button/Button";

interface TrashSelectionBarProps {
  count: number;
  pending: boolean;
  restoring: boolean;
  deleting: boolean;
  onCancel: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

export function TrashSelectionBar({
  count,
  pending,
  restoring,
  deleting,
  onCancel,
  onRestore,
  onDelete,
}: TrashSelectionBarProps) {
  const t = useTranslations("trash");
  return (
    <footer className="shrink-0 border-t border-(--border) bg-(--surface) px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
      <div className="flex items-center justify-between gap-3">
        <p role="status" className="text-sm font-medium">
          {t("selectedCount", { count })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11"
          disabled={pending}
          onClick={onCancel}
        >
          {t("cancelSelection")}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
        <Button
          variant="primary"
          size="sm"
          className="min-h-11"
          disabled={pending}
          onClick={onRestore}
        >
          {restoring ? t("restoringSelectedAction") : t("restoreSelected")}
        </Button>
        <Button
          variant="dangerOutline"
          size="sm"
          className="min-h-11"
          disabled={pending}
          onClick={onDelete}
        >
          {deleting ? t("deletingSelectedAction") : t("deleteSelected")}
        </Button>
      </div>
    </footer>
  );
}
