"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { logout as requestLogout } from "@/features/auth/api/authApi";
import { useCurrentUserQuery } from "@/features/auth/queries/useCurrentUserQuery";
import { currentUserQueryOptions } from "@/features/auth/queries/currentUserQueryOptions";
import {
  getAuthError,
  getAuthStatus,
} from "@/features/auth/service/authSessionState";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/client/AuthContext";
import { ApiError, subscribeToAuthExpired } from "@/shared/lib/apiClient";
import {
  getLogoutIntent,
  getServerLogoutIntent,
  setLogoutIntent,
  subscribeLogoutIntent,
} from "@/features/auth/service/logoutIntent";

// 앱 전체에서 하나의 사용자 인증 상태와 만료·로그아웃 생명주기를 관리합니다.
export function AuthProvider({
  children,
  shouldRestoreSession,
}: {
  children: React.ReactNode;
  shouldRestoreSession: boolean;
}) {
  const queryClient = useQueryClient();
  const logoutIntent = useSyncExternalStore(
    subscribeLogoutIntent,
    getLogoutIntent,
    getServerLogoutIntent,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutRequest = useRef<Promise<void> | null>(null);

  // 접속후 토근 존재시 로그인 유지 시도
  const [isAuthQueryEnabled, setIsAuthQueryEnabled] = useState(
    () => shouldRestoreSession,
  );

  // 유저 정보 호출
  const currentUserQuery = useCurrentUserQuery({
    enabled: isAuthQueryEnabled && !logoutIntent,
  });

  // 별칭
  const session = currentUserQuery.data;

  // 현재 auth상태
  const status = logoutIntent
    ? isLoggingOut
      ? "logging-out"
      : "logout-error"
    : getAuthStatus({
        error: currentUserQuery.error,
        isError: currentUserQuery.isError,
        isFetching: currentUserQuery.isFetching,
        isPending: currentUserQuery.isPending,
        isAuthQueryEnabled,
        session,
      });

  const shouldClearClientSession =
    isAuthQueryEnabled && status === "unauthenticated";

  // 현재 에러 상태
  const error = getAuthError(status, currentUserQuery.error);

  // 인증 정보가 사라질 때 사용자별 서버 상태를 담은 Query cache도 폐기합니다.
  // 현재 단일 유저를 위한 서비스이기에 쿼리 clear함수를 사용해 session 정리시 전체 캐시가 확실히 제거될 수 있도록 합니다.
  const clearClientSession = useCallback(() => {
    setIsAuthQueryEnabled(false);
    queryClient.clear();
  }, [queryClient]);

  const restoreSession = async () => {
    if (getLogoutIntent()) return null;
    try {
      return await queryClient.fetchQuery(currentUserQueryOptions());
    } catch {
      return null;
    }
  };

  const logout = useCallback(() => {
    if (logoutRequest.current) return logoutRequest.current;
    setIsLoggingOut(true);
    setLogoutIntent(true);
    clearClientSession();
    const request = requestLogout()
      .then(() => setLogoutIntent(false))
      .finally(() => {
        setIsLoggingOut(false);
        logoutRequest.current = null;
      });
    logoutRequest.current = request;
    return request;
  }, [clearClientSession]);

  // user/me 조회 결과 감시
  useEffect(() => {
    if (!shouldClearClientSession) {
      return;
    }

    if (
      currentUserQuery.error instanceof ApiError &&
      currentUserQuery.error.status === 404
    ) {
      // 유효하지 않은 사용자 쿠키 제거를 시도하되, 경로 이동은 AuthGuard가 결정합니다.
      void requestLogout().catch(() => undefined);
    }

    // 인증 실패 시 조회를 끈 뒤 외부 Query 캐시를 폐기해야 재조회 루프를 막습니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    clearClientSession();
  }, [clearClientSession, currentUserQuery.error, shouldClearClientSession]);

  // API Client가 인증 만료 이벤트를 알리면 클라이언트 세션을 정리합니다.
  useEffect(
    () =>
      subscribeToAuthExpired(() => {
        // 만료 이벤트에서는 상태만 정리하고 경로 이동은 AuthGuard가 결정합니다.
        clearClientSession();
      }),
    [clearClientSession],
  );

  const value: AuthContextValue = {
    user: logoutIntent ? null : (session?.user ?? null),
    status,
    error,
    restoreSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
