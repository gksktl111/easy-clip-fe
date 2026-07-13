"use client";

import { useEffect } from "react";
import { clearAuthSession, useAuthSession } from "@/features/auth";
import { syncUserSettings } from "@/features/settings";
import { ApiError } from "@/shared/lib/apiClient";

// 인증 세션이 준비되면 서버 사용자 설정을 전역 설정 store에 반영합니다.
export function UserSettingsSync() {
  const session = useAuthSession();

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    void syncUserSettings().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthSession();
      }
    });
  }, [session]);

  return null;
}
