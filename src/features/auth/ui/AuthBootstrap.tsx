"use client";

import { useEffect, useRef } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { syncUserSettings } from "@/features/settings/service/settingsService";
import { ApiError } from "@/shared/lib/apiClient";
import {
  clearSessionOnUnauthorized,
  syncSessionProfile,
} from "@/features/auth/service/authService";

export function AuthBootstrap() {
  const session = useAuthSession();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) {
      lastTokenRef.current = null;
      return;
    }

    const currentSession = session;
    const accessToken = currentSession.accessToken;

    if (lastTokenRef.current === accessToken) {
      return;
    }

    lastTokenRef.current = accessToken;

    void Promise.all([
      currentSession.user
        ? Promise.resolve(currentSession)
        : syncSessionProfile(currentSession),
      syncUserSettings(accessToken),
    ]).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionOnUnauthorized();
      }
    });
  }, [session]);

  return null;
}
