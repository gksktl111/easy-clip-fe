"use client";
import { useTranslations } from "next-intl";
export function FolderClipCaptureHint({ isActive }: { isActive: boolean }) {
  const t = useTranslations("clips");
  return !isActive ? (
    <div className="hidden px-6 pt-3 md:block">
      <p className="rounded-xl border border-(--border) bg-(--surface) px-3 py-3 text-xs leading-relaxed text-(--muted)">
        {t("captureHint")}
      </p>
    </div>
  ) : null;
}
