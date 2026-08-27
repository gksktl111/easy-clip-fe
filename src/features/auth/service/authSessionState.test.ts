import { describe, expect, it } from "vitest";
import type { AuthSession } from "@/features/auth/model/auth";
import { ApiError } from "@/shared/lib/apiClient";
import {
  getAuthError,
  getAuthStatus,
  isUnauthenticatedSessionError,
} from "@/features/auth/service/authSessionState";

const authenticatedSession: AuthSession = {
  user: {
    id: "user-1",
    displayName: "Easy Clip",
    avatarUrl: null,
    email: "user@example.com",
  },
};

const getStatus = (
  overrides: Partial<Parameters<typeof getAuthStatus>[0]> = {},
) =>
  getAuthStatus({
    error: null,
    isError: false,
    isFetching: false,
    isPending: false,
    isAuthQueryEnabled: true,
    session: undefined,
    ...overrides,
  });

describe("인증 세션 상태", () => {
  it("세션 복구를 허용하지 않으면 미인증 상태가 된다", () => {
    expect(getStatus({ isAuthQueryEnabled: false })).toBe("unauthenticated");
  });

  it("현재 사용자 query 진행 중에는 초기화 상태가 된다", () => {
    expect(getStatus({ isPending: true })).toBe("initializing");
  });

  it("오류 화면에서 세션 복구를 재시도하는 동안에는 초기화 상태가 된다", () => {
    expect(getStatus({ isError: true, isFetching: true })).toBe("initializing");
  });

  it("현재 사용자 정보가 있으면 인증 상태가 된다", () => {
    expect(getStatus({ session: authenticatedSession })).toBe("authenticated");
  });

  it.each([401, 404])("세션 확인의 %i 응답은 미인증 상태가 된다", (status) => {
    expect(getStatus({ error: new ApiError("인증 실패", status) })).toBe(
      "unauthenticated",
    );
  });

  it("재시도 가능한 오류는 오류 상태와 오류 객체를 유지한다", () => {
    const error = new Error("네트워크 오류");

    expect(getStatus({ error, isError: true })).toBe("error");
    expect(getAuthError("error", error)).toBe(error);
  });

  it("인증 오류 여부를 상태 코드로 구분한다", () => {
    expect(isUnauthenticatedSessionError(new ApiError("만료", 401))).toBe(true);
    expect(isUnauthenticatedSessionError(new ApiError("서버 오류", 500))).toBe(
      false,
    );
  });
});
