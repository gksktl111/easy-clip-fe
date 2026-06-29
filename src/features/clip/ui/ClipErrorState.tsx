"use client";

import { useTranslations } from "next-intl";
import { HiOutlineRefresh } from "react-icons/hi";

interface ClipErrorStateProps {
  onRetry?: () => void;
}

export function ClipErrorState({ onRetry }: ClipErrorStateProps) {
  const t = useTranslations("clips.errorState");

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-(--background) px-5 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,var(--surface)_52%,rgba(239,68,68,0.08)_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-(--border)" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-(--border)" />

      <div
        role="alert"
        className="relative flex w-full max-w-lg flex-col items-center gap-4 px-1 py-2 text-center"
      >
        <div>
          <p className="text-sm font-semibold text-(--foreground)">
            {t("title")}
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-(--muted)">
            {t("description")}
          </p>
        </div>

        {onRetry ? (
          <button
            type="button"
            className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--surface-elevated) px-4 text-sm font-semibold text-(--foreground) shadow-sm transition hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
            onClick={onRetry}
          >
            <HiOutlineRefresh className="h-4 w-4 text-(--danger)" aria-hidden />
            <span>{t("retry")}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
