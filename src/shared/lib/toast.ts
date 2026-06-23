"use client";

import { toast } from "sonner";

export const notifyError = (message: string, description?: string) => {
  // 앱 전역 알림 정책은 이 헬퍼를 통해 한 곳에서 조정한다.
  toast.error(message, {
    description,
  });
};

export const notifySuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
  });
};
