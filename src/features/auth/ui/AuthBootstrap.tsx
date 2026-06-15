"use client";

import { useEffect, useRef } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { syncUserSettings } from "@/features/settings/service/settingsService";
import { ApiError } from "@/shared/lib/apiClient";
import {
  clearSessionOnUnauthorized,
  restoreSessionFromRefreshCookie,
  syncSessionProfile,
} from "@/features/auth/service/authService";

export function AuthBootstrap() {
  const session = useAuthSession();
  const lastTokenRef = useRef<string | null>(null);
  const hasTriedCookieRestoreRef = useRef(false);

  useEffect(() => {
    if (!session?.accessToken) {
      lastTokenRef.current = null;
      if (!hasTriedCookieRestoreRef.current) {
        hasTriedCookieRestoreRef.current = true;

        void restoreSessionFromRefreshCookie().catch(() => {
          // No refresh cookie means the user is simply logged out.
        });
      }
      return;
    }

    const currentSession = session;
    const accessToken = currentSession.accessToken;

    if (lastTokenRef.current === accessToken) {
      return;
    }

    lastTokenRef.current = accessToken;

    void Promise.all([
      syncSessionProfile(currentSession),
      syncUserSettings(accessToken),
    ]).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionOnUnauthorized();
      }
    });
  }, [session]);

  return null;
}
