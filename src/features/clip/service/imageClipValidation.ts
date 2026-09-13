import { ApiError } from "@/shared/lib/apiClient";

export const ALLOWED_IMAGE_CLIP_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

// 서버 오류 응답과 비교하는 계약 문자열이며 사용자에게 직접 표시하지 않습니다.
const BACKEND_UNSUPPORTED_IMAGE_MESSAGE =
  "현재 jpeg, png, webp, gif, avif 이미지만 업로드할 수 있습니다.";

export const isAllowedImageClipFile = (file: File) =>
  ALLOWED_IMAGE_CLIP_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_IMAGE_CLIP_MIME_TYPES)[number],
  );

export const isUnsupportedImageClipError = (error: unknown) =>
  error instanceof ApiError &&
  error.status === 400 &&
  error.message === BACKEND_UNSUPPORTED_IMAGE_MESSAGE;
