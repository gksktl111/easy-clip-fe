"use client";

import { useTranslations } from "next-intl";
import { HiOutlineClipboardCopy } from "react-icons/hi";

export function EmptyState() {
  const t = useTranslations("clips.emptyState");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="flex max-w-sm flex-col items-center rounded-3xl border border-dashed border-(--border) bg-(--surface) px-8 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--icon-chip) text-(--icon-chip-text)">
          <HiOutlineClipboardCopy className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-foreground mt-5 text-base font-semibold">
          {t("title")}
        </p>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          {t("description")}
        </p>
      </div>
    </div>
  );
}
