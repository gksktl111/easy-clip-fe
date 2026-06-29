import { ApiError } from "@/shared/lib/apiClient";

export const ALLOWED_IMAGE_CLIP_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const IMAGE_CLIP_ACCEPT = ALLOWED_IMAGE_CLIP_MIME_TYPES.join(",");

export const UNSUPPORTED_IMAGE_CLIP_MESSAGE =
  "SVG 파일은 보안상 업로드할 수 없어요. PNG/JPG/WebP 등으로 변환해 주세요.";

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
