import {
  AccessChangedError,
  getAccessGeneration,
  requestAccessRefresh,
} from "@/shared/access/accessEvents";
import { buildApiUrl } from "@/shared/config/env";

type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  skipAuthRefresh?: boolean;
  hasRetriedAuth?: boolean;
};

export class ApiError extends Error {
  status: number;

  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise: Promise<void> | null = null;

const AUTH_EXPIRED_EVENT = "auth-session:expired";
const REFRESH_RETRY_DELAYS_MS = [300, 800] as const;

const notifyAuthExpired = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

export const subscribeToAuthExpired = (callback: () => void) => {
  window.addEventListener(AUTH_EXPIRED_EVENT, callback);

  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, callback);
};

const isAuthRefreshExcludedPath = (path: string) =>
  path === "/auth/refresh" || path === "/auth/logout";

const readApiError = async (response: Response) => {
  let message = `Request failed with status ${response.status}`;
  let code: string | undefined;
  let details: Record<string, unknown> | undefined;
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object") {
      const data = body as Record<string, unknown>;
      if (typeof data.message === "string" && data.message)
        message = data.message;
      if (Array.isArray(data.message)) {
        const messages = data.message.filter(
          (value): value is string => typeof value === "string",
        );
        if (messages.length) message = messages.join("\n");
      }
      if (typeof data.code === "string") code = data.code;
      if (
        data.details &&
        typeof data.details === "object" &&
        !Array.isArray(data.details)
      ) {
        details = data.details as Record<string, unknown>;
      }
    }
  } catch {
    // HTML/빈 오류 응답도 HTTP 상태 기반으로 처리합니다.
  }
  return new ApiError(message, response.status, code, details);
};

const wait = (delayMs: number) =>
  new Promise((resolve) => window.setTimeout(resolve, delayMs));

const isRetryableRefreshError = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return true;
  }

  return error.status === 408 || error.status === 429 || error.status >= 500;
};

const refreshWithRetry = async () => {
  for (
    let attempt = 0;
    attempt <= REFRESH_RETRY_DELAYS_MS.length;
    attempt += 1
  ) {
    try {
      await apiRequest<unknown>("/auth/refresh", {
        method: "POST",
        skipAuthRefresh: true,
      });
      return;
    } catch (error) {
      const isLastAttempt = attempt === REFRESH_RETRY_DELAYS_MS.length;

      if (isLastAttempt || !isRetryableRefreshError(error)) {
        throw error;
      }

      // 일시적인 네트워크/서버 지연은 짧게 기다렸다가 refresh만 재시도한다.
      await wait(REFRESH_RETRY_DELAYS_MS[attempt]);
    }
  }
};

const requestTokenRefresh = async () => {
  if (!refreshPromise) {
    // 동시에 여러 요청이 401을 받아도 refresh 호출은 이 Promise 하나로 합친다.
    refreshPromise = refreshWithRetry()
      .catch((error) => {
        // refresh가 최종 실패하면 이 요청 묶음의 인증 만료를 한 번 알립니다.
        notifyAuthExpired();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiRequest = async <T>(
  path: string,
  {
    headers,
    skipAuthRefresh = false,
    hasRetriedAuth = false,
    credentials,
    ...init
  }: ApiRequestOptions = {},
): Promise<T> => {
  const requestGeneration = getAccessGeneration();
  const isContentRequest =
    /^\/(clips|trash)(?:[/?]|$)/.test(path) ||
    /^\/folders\/[^/]+\/tags(?:[/?]|$)/.test(path);
  const response = await fetch(buildApiUrl(path), {
    ...init,
    // httpOnly 쿠키 기반 인증이므로 모든 API 요청에 쿠키를 포함한다.
    credentials: credentials ?? "include",
    headers: new Headers(headers),
  });

  if (isContentRequest && requestGeneration !== getAccessGeneration())
    throw new AccessChangedError();

  if (!response.ok) {
    if (
      response.status === 401 &&
      !skipAuthRefresh &&
      !hasRetriedAuth &&
      !isAuthRefreshExcludedPath(path)
    ) {
      await requestTokenRefresh();

      return apiRequest<T>(path, {
        ...init,
        headers,
        credentials,
        skipAuthRefresh,
        hasRetriedAuth: true,
      });
    }

    if (response.status === 401 && hasRetriedAuth) {
      // refresh 성공 후에도 원래 요청이 401이면 세션이 더는 유효하지 않습니다.
      notifyAuthExpired();
    }

    const error = await readApiError(response);
    if (
      [
        "PROJECT_LOCKED",
        "PLAN_LIMIT_EXCEEDED",
        "FEATURE_NOT_AVAILABLE",
      ].includes(error.code ?? "")
    ) {
      requestAccessRefresh("policy");
    }
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  const responseBody = await response.text();

  if (!responseBody) {
    return null as T;
  }

  if (isContentRequest && requestGeneration !== getAccessGeneration())
    throw new AccessChangedError();
  return JSON.parse(responseBody) as T;
};
