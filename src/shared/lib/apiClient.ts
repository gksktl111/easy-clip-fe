import { buildApiUrl } from "@/shared/config/env";

type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  accessToken?: string | null;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const mergeHeaders = (
  headers: HeadersInit | undefined,
  accessToken?: string | null,
) => {
  const merged = new Headers(headers);

  if (accessToken) {
    merged.set("Authorization", `Bearer ${accessToken}`);
  }

  return merged;
};

export const apiRequest = async <T>(
  path: string,
  { accessToken, headers, ...init }: ApiRequestOptions = {},
) => {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: mergeHeaders(headers, accessToken),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (typeof errorBody.message === "string" && errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // ignore invalid error bodies
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};
