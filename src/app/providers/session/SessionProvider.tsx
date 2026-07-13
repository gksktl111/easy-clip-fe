"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  logout as requestLogout,
  restoreSessionFromRefreshCookie,
} from "@/features/auth";
import { notifyError } from "@/shared/feedback/toast";
import { ApiError, subscribeToAuthExpired } from "@/shared/lib/apiClient";
import type { SessionStatus, UserSession } from "@/shared/session/session";
import {
  SessionContext,
  type SessionContextValue,
} from "@/shared/session/sessionContext";

// 앱 전체에서 하나의 사용자 세션 복구 상태와 만료·로그아웃 생명주기를 관리합니다.
export function SessionProvider({
  children,
  shouldRestoreSession,
}: {
  children: React.ReactNode;
  shouldRestoreSession: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<UserSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>(() =>
    shouldRestoreSession ? "idle" : "unauthenticated",
  );
  const [error, setError] = useState<Error | null>(null);
  // 동시에 들어오는 세션 복구 요청은 하나의 /users/me 요청으로 합칩니다.
  const restorePromiseRef = useRef<Promise<UserSession | null> | null>(null);

  // 인증 정보가 사라질 때 사용자별 서버 상태를 담은 Query cache도 폐기합니다.
  const clearClientSession = useCallback(() => {
    queryClient.clear();
    setSession(null);
    setError(null);
    setStatus("unauthenticated");
  }, [queryClient]);

  const restoreSession = useCallback(() => {
    if (restorePromiseRef.current) {
      return restorePromiseRef.current;
    }

    setError(null);
    setStatus("initializing");

    const restorePromise = restoreSessionFromRefreshCookie()
      .then((nextSession) => {
        setSession(nextSession);
        setStatus("authenticated");
        return nextSession;
      })
      .catch(async (restoreError: unknown) => {
        if (
          restoreError instanceof ApiError &&
          (restoreError.status === 401 || restoreError.status === 404)
        ) {
          clearClientSession();

          if (restoreError.status === 404) {
            // 유효하지 않은 사용자 쿠키 제거를 시도해 Proxy redirect 반복을 방지합니다.
            notifyError("존재하지 않는 유저입니다.");
            await requestLogout().catch(() => undefined);
            router.replace("/login");
          }

          return null;
        }

        setSession(null);
        setError(
          restoreError instanceof Error
            ? restoreError
            : new Error("사용자 세션을 확인하지 못했습니다."),
        );
        setStatus("error");
        return null;
      });

    restorePromiseRef.current = restorePromise;
    void restorePromise.finally(() => {
      if (restorePromiseRef.current === restorePromise) {
        restorePromiseRef.current = null;
      }
    });

    return restorePromise;
  }, [clearClientSession, router]);

  const logout = useCallback(async () => {
    try {
      await requestLogout();
    } catch {
      // 서버 세션 상태와 무관하게 클라이언트 사용자 상태는 정리합니다.
    } finally {
      clearClientSession();
      router.replace("/login");
      router.refresh();
    }
  }, [clearClientSession, router]);

  useEffect(() => {
    // 최상위 Provider가 쿠키 기반 세션 복구를 한 번만 시작합니다.
    if (status === "idle") {
      void restoreSession();
    }
  }, [restoreSession, status]);

  useEffect(
    () =>
      subscribeToAuthExpired(() => {
        // 만료 이벤트에서는 상태만 정리하고 경로 이동은 AuthGuard가 결정합니다.
        clearClientSession();
      }),
    [clearClientSession],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      error,
      restoreSession,
      logout,
    }),
    [error, logout, restoreSession, session?.user, status],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
