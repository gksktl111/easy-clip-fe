"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "sonner";

export interface ToastMessageProps {
  id: string | number;
  variant: "success" | "error";
  message: string;
  description?: string;
}

export function ToastMessage({
  id,
  variant,
  message,
  description,
}: ToastMessageProps) {
  const t = useTranslations("feedback");
  const Icon =
    variant === "success" ? HiOutlineCheckCircle : HiOutlineExclamationCircle;
  return (
    <div className="flex w-[360px] max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-(--foreground) shadow-lg shadow-black/10">
      <Icon
        aria-hidden
        className={`mt-0.5 h-5 w-5 shrink-0 ${variant === "success" ? "text-(--success)" : "text-(--danger-text)"}`}
      />
      <div className="min-w-0 flex-1 text-sm leading-5 break-words">
        <p className="font-semibold">{message}</p>
        {description ? (
          <p className="mt-1 text-(--muted)">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={t("close")}
        onClick={() => toast.dismiss(id)}
        className="shrink-0 cursor-pointer rounded p-1 text-(--muted) hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
      >
        <HiOutlineX aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
