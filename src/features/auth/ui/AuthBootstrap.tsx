"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/features/auth/api/authApi";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { syncUserSettings } from "@/features/settings/service/settingsService";
import { ApiError, subscribeToAuthExpired } from "@/shared/lib/apiClient";
import {
  clearSessionOnUnauthorized,
  restoreSessionFromRefreshCookie,
} from "@/features/auth/service/authService";
import { notifyError } from "@/shared/feedback/toast";

// 앱 전역의 인증 세션을 복구하고 만료 상태를 라우팅 및 캐시와 동기화합니다.
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

    void restoreSessionFromRefreshCookie().catch(async (error: unknown) => {
      if (!(error instanceof ApiError)) {
        return;
      }

      if (error.status === 401) {
        clearSessionOnUnauthorized();
        return;
      }

      if (error.status === 404) {
        clearSessionOnUnauthorized();
        queryClient.clear();
        // 쿠키는 있지만 서버에 유저가 없으면 사용자를 랜딩으로 되돌려 재진입을 유도한다.
        notifyError("존재하지 않는 유저입니다.");
        await logout().catch(() => undefined);
        router.push("/");
      }
    });
  }, [queryClient, router]);

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
