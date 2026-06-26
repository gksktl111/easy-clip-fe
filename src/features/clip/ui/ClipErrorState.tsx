"use client";

import { useTranslations } from "next-intl";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface ClipErrorStateProps {
  onRetry?: () => void;
}

export function ClipErrorState({ onRetry }: ClipErrorStateProps) {
  const t = useTranslations("clips.errorState");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="flex max-w-sm flex-col items-center rounded-3xl border border-red-200 bg-red-50 px-8 py-10 text-center text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-200">
          <HiOutlineExclamationCircle className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-5 text-base font-semibold">{t("title")}</p>
        <p className="mt-2 text-sm leading-relaxed text-red-700 dark:text-red-200/80">
          {t("description")}
        </p>
        {onRetry ? (
          <button
            type="button"
            className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            onClick={onRetry}
          >
            {t("retry")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
