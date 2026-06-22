"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { syncUserSettings } from "@/features/settings/service/settingsService";
import { ApiError, subscribeToAuthExpired } from "@/shared/lib/apiClient";
import {
  clearSessionOnUnauthorized,
  restoreSessionFromRefreshCookie,
} from "@/features/auth/service/authService";

export function AuthBootstrap() {
  const session = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthExpired(() => {
      clearSessionOnUnauthorized();
      queryClient.clear();

      if (pathname !== "/login") {
        router.push("/login");
      }
    });

    return unsubscribe;
  }, [pathname, queryClient, router]);

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;

    void restoreSessionFromRefreshCookie().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionOnUnauthorized();
      }
    });
  }, []);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    void syncUserSettings().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionOnUnauthorized();
      }
    });
  }, [session]);

  return null;
}
