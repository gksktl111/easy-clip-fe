"use client";

import { createElement } from "react";
import { toast } from "sonner";

const TOAST_DURATION_MS = 3000;

type ToastVariant = "error" | "success";

const TOAST_ACCENT_CLASS: Record<ToastVariant, string> = {
  error: "bg-(--danger)",
  success: "bg-(--success)",
};

const renderToast = (
  id: string | number,
  variant: ToastVariant,
  message: string,
  description?: string,
) =>
  createElement(
    "button",
    {
      type: "button",
      onClick: () => toast.dismiss(id),
      className:
        "flex w-[360px] max-w-[calc(100vw-32px)] cursor-pointer items-start gap-3 rounded-xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-left text-(--foreground) shadow-lg shadow-black/10 transition hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)",
      "aria-label": `${message} 알림 닫기`,
    },
    createElement("span", {
      className: `mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${TOAST_ACCENT_CLASS[variant]}`,
      "aria-hidden": true,
    }),
    createElement(
      "span",
      {
        className: "min-w-0 flex-1",
      },
      createElement(
        "span",
        {
          className: "block text-sm font-semibold leading-5",
        },
        message,
      ),
      description
        ? createElement(
            "span",
            {
              className: "mt-1 block text-sm leading-5 text-(--muted)",
            },
            description,
          )
        : null,
    ),
  );

const notify = (
  variant: ToastVariant,
  message: string,
  description?: string,
) => {
  toast.custom((id) => renderToast(id, variant, message, description), {
    duration: TOAST_DURATION_MS,
  });
};

export const notifyError = (message: string, description?: string) => {
  // 앱 전역 알림 정책은 이 헬퍼를 통해 한 곳에서 조정한다.
  notify("error", message, description);
};

export const notifySuccess = (message: string, description?: string) => {
  notify("success", message, description);
};
