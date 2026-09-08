"use client";

import { useCallback, useEffect, useState } from "react";
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

// 앱 전체에서 하나의 사용자 인증 상태와 만료·로그아웃 생명주기를 관리합니다.
export function AuthProvider({
  children,
  shouldRestoreSession,
}: {
  children: React.ReactNode;
  shouldRestoreSession: boolean;
}) {
  const queryClient = useQueryClient();

  // 접속후 토근 존재시 로그인 유지 시도
  const [isAuthQueryEnabled, setIsAuthQueryEnabled] = useState(
    () => shouldRestoreSession,
  );

  // 유저 정보 호출
  const currentUserQuery = useCurrentUserQuery({
    enabled: isAuthQueryEnabled,
  });

  // 별칭
  const session = currentUserQuery.data;

  // 현재 auth상태
  const status = getAuthStatus({
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
    try {
      return await queryClient.fetchQuery(currentUserQueryOptions());
    } catch {
      return null;
    }
  };

  const logout = async () => {
    try {
      await requestLogout();
    } catch {
      // 서버 세션 상태와 무관하게 클라이언트 사용자 상태는 정리합니다.
    } finally {
      clearClientSession();
    }
  };

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
    user: session?.user ?? null,
    status,
    error,
    restoreSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
