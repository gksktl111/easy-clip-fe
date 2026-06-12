const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getRequiredPublicEnv = (name: "NEXT_PUBLIC_API_BASE_URL") => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return trimTrailingSlash(value);
};

export const getApiBaseUrl = () =>
  getRequiredPublicEnv("NEXT_PUBLIC_API_BASE_URL");

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};
