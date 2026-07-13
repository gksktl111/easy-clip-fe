"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { syncUserSettings } from "@/features/settings";
import { notifyError } from "@/shared/feedback/toast";
import { ApiError } from "@/shared/lib/apiClient";
import { useSession } from "@/shared/session/useSession";

interface UserSettingsSyncProps {
  enabled: boolean;
}

const isRetryableSettingsError = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return true;
  }

  return error.status === 408 || error.status === 429 || error.status >= 500;
};

// 서버 Settings 초기화가 실패한 경우에만 인증 복구 뒤 설정을 보완합니다.
export function UserSettingsSync({ enabled }: UserSettingsSyncProps) {
  const t = useTranslations("settings");
  const { status, user } = useSession();
  const notifiedErrorRef = useRef<unknown>(null);
  const shouldSync = enabled && status === "authenticated" && Boolean(user);
  const settingsQuery = useQuery({
    queryKey: ["user-settings-bootstrap", user?.id ?? null],
    queryFn: syncUserSettings,
    enabled: shouldSync,
    retry: (failureCount, error) =>
      failureCount < 2 && isRetryableSettingsError(error),
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 2_000),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!settingsQuery.error) {
      notifiedErrorRef.current = null;
      return;
    }

    if (
      settingsQuery.error instanceof ApiError &&
      settingsQuery.error.status === 401
    ) {
      return;
    }

    if (notifiedErrorRef.current === settingsQuery.error) {
      return;
    }

    notifiedErrorRef.current = settingsQuery.error;
    notifyError(t("loadError"));
  }, [settingsQuery.error, t]);

  return null;
}
