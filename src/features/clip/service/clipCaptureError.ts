import { ApiError } from "@/shared/lib/apiClient";
import { isUnsupportedImageClipError } from "./imageClipValidation";

export const uploadRetrySeconds = (error: unknown) =>
  error instanceof ApiError && error.retryAt
    ? Math.max(0, Math.ceil((error.retryAt - Date.now()) / 1000))
    : 0;
export const clipCaptureErrorKey = (
  error: unknown,
  inputType: "text" | "image",
) => {
  if (error instanceof ApiError) {
    if (error.status === 413) return "uploadTooLarge";
    if (error.status === 429) return "uploadRateLimited";
    if (error.status === 503) return "uploadUnavailable";
  }
  if (isUnsupportedImageClipError(error)) return "unsupportedImage";
  return inputType === "text" ? "textSaveFailed" : "imageSaveFailed";
};
