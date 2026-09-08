import { ApiError } from "@/shared/lib/apiClient";

export const POLICY_ERROR_CODES = [
  "PROJECT_LOCKED",
  "CLIP_LIMIT_EXCEEDED",
  "PLAN_LIMIT_EXCEEDED",
  "FEATURE_NOT_AVAILABLE",
] as const;

export const isPolicyError = (error: unknown): error is ApiError =>
  error instanceof ApiError &&
  (error.status === 403 || error.status === 409) &&
  POLICY_ERROR_CODES.some((code) => code === error.code);

export const getPolicyLimitDetails = (error: ApiError) => {
  const details = error.details;
  const count = (key: string) => {
    const value = details?.[key];
    return typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 0
      ? value
      : null;
  };
  return {
    limit: count("limit"),
    currentCount: count("currentCount"),
    upgradeCanResolve: details?.upgradeCanResolve === true,
  };
};
