"use client";

import { useTranslations } from "next-intl";
interface DeleteAllButtonProps {
  disabled?: boolean;
  label?: string;
  onClick: () => void;
}

export function DeleteAllButton({
  disabled = false,
  label,
  onClick,
}: DeleteAllButtonProps) {
  const t = useTranslations("clips.actions");
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="absolute right-4 bottom-4 rounded-full bg-(--danger) px-4 py-2 text-sm font-semibold text-danger-foreground shadow-lg transition hover:bg-(--danger-hover) disabled:cursor-not-allowed disabled:opacity-50 md:right-6 md:bottom-6"
    >
      {label ?? t("deleteAll")}
    </button>
  );
}
