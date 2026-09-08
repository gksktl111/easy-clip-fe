import type { AuthSession, AuthStatus } from "@/features/auth/model/auth";
import { ApiError } from "@/shared/lib/apiClient";

interface GetAuthStatusOptions {
  error: unknown;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  isAuthQueryEnabled: boolean;
  session: AuthSession | undefined;
}

export const isUnauthenticatedSessionError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 404);

// Query 상태를 보호 경로가 소비하는 인증 상태 계약으로 변환합니다.
export const getAuthStatus = ({
  error,
  isError,
  isFetching,
  isPending,
  isAuthQueryEnabled,
  session,
}: GetAuthStatusOptions): AuthStatus => {
  if (!isAuthQueryEnabled || isUnauthenticatedSessionError(error)) {
    return "unauthenticated";
  }

  if (isPending || (isFetching && !session)) {
    return "initializing";
  }

  if (session) {
    return "authenticated";
  }

  if (isError) {
    return "error";
  }

  return "idle";
};

export const getAuthError = (status: AuthStatus, error: unknown) => {
  if (status !== "error") {
    return null;
  }

  return error instanceof Error
    ? error
    : new Error("사용자 세션을 확인하지 못했습니다.");
};
