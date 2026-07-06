const trimTrailingSlash = (value: string) => value.trim().replace(/\/+$/, "");

const getRequiredPublicEnv = (
  name: "NEXT_PUBLIC_API_BASE_URL",
  value: string | undefined,
) => {
  if (!value && process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return trimTrailingSlash(value);
};

export const getApiBaseUrl = () =>
  getRequiredPublicEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  );

export const isLocalApiBaseUrl = () => {
  const apiBaseUrl = getApiBaseUrl();

  try {
    const url = new URL(apiBaseUrl);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};
