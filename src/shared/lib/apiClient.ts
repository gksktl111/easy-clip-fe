import { buildApiUrl } from "@/shared/config/env";

type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  skipAuthRefresh?: boolean;
  hasRetriedAuth?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let refreshPromise: Promise<void> | null = null;

const AUTH_EXPIRED_EVENT = "auth-session:expired";
const REFRESH_RETRY_DELAYS_MS = [300, 800] as const;

const dispatchAuthExpired = () => {
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

const readErrorMessage = async (response: Response) => {
  let message = `Request failed with status ${response.status}`;

  try {
    const errorBody = (await response.json()) as { message?: string };
    if (typeof errorBody.message === "string" && errorBody.message) {
      message = errorBody.message;
    }
  } catch {
    // 응답 본문이 JSON이 아니어도 status 기준 에러 처리는 유지한다.
  }

  return message;
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
  for (let attempt = 0; attempt <= REFRESH_RETRY_DELAYS_MS.length; attempt += 1) {
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
        dispatchAuthExpired();
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
  const response = await fetch(buildApiUrl(path), {
    ...init,
    // httpOnly 쿠키 기반 인증이므로 모든 API 요청에 쿠키를 포함한다.
    credentials: credentials ?? "include",
    headers: new Headers(headers),
  });

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

    if (response.status === 401 && (hasRetriedAuth || skipAuthRefresh)) {
      dispatchAuthExpired();
    }

    const message = await readErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};
