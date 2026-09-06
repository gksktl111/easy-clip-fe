import { ApiError } from "@/shared/lib/apiClient";

// 존재하지 않는 폴더를 가리키는 404는 재시도나 일반 오류 화면으로 처리하지 않습니다.
export const isFolderNotFoundError = (error: unknown) =>
  error instanceof ApiError && error.status === 404;

// TanStack Query 기본 재시도 횟수와 같게 유지하되, 폴더 404는 즉시 중단합니다.
export const shouldRetryFolderClipsQuery = (
  failureCount: number,
  error: unknown,
) => !isFolderNotFoundError(error) && failureCount < 3;
