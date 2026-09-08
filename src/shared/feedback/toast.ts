"use client";

import { createElement } from "react";
import { toast } from "sonner";
import { ToastMessage, type ToastMessageProps } from "./ToastMessage";

export const TOAST_DURATION_MS = 4000;
let sequence = 0;

const notify = (
  variant: ToastMessageProps["variant"],
  message: string,
  description?: string,
  eventId?: string,
) => {
  const prefix =
    JSON.stringify(
      eventId ? ["event", eventId] : ["result", variant, message, description],
    ) + ":";
  const existing = toast
    .getToasts()
    .find((item) => typeof item.id === "string" && item.id.startsWith(prefix));
  // 닫힘 애니메이션 중인 ID를 재사용하면 Sonner가 새 결과까지 제거할 수 있습니다.
  const id = existing?.id ?? `${prefix}${++sequence}`;
  return toast.custom(
    (id) => createElement(ToastMessage, { id, variant, message, description }),
    {
      // 같은 결과의 연속 호출은 쌓지 않고 기존 알림과 표시 시간을 갱신합니다.
      id,
      onAutoClose: (item) => {
        toast.dismiss(item.id);
      },
      onDismiss: (item) => {
        toast.dismiss(item.id);
      },
      duration: TOAST_DURATION_MS,
    },
  );
};

export const notifyError = (
  message: string,
  description?: string,
  eventId?: string,
) => notify("error", message, description, eventId);

export const notifySuccess = (
  message: string,
  description?: string,
  eventId?: string,
) => notify("success", message, description, eventId);
