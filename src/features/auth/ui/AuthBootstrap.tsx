"use client";

import { useEffect, useRef } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  clearSessionOnUnauthorized,
  syncSessionProfile,
} from "@/features/auth/service/authApi";
import { ApiError } from "@/shared/lib/apiClient";

export function AuthBootstrap() {
  const session = useAuthSession();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) {
      lastTokenRef.current = null;
      return;
    }

    if (lastTokenRef.current === session.accessToken && session.user) {
      return;
    }

    lastTokenRef.current = session.accessToken;

    void syncSessionProfile(session).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionOnUnauthorized();
      }
    });
  }, [session]);

  return null;
}
