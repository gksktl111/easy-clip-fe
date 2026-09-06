import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/lib/apiClient";
import {
  isFolderNotFoundError,
  shouldRetryFolderClipsQuery,
} from "@/features/clip/service/folderClipQueryState";

describe("폴더 클립 조회 오류 상태", () => {
  it("404 응답을 존재하지 않는 폴더 오류로 구분한다", () => {
    expect(
      isFolderNotFoundError(new ApiError("폴더를 찾을 수 없습니다.", 404)),
    ).toBe(true);
    expect(isFolderNotFoundError(new ApiError("서버 오류", 500))).toBe(false);
    expect(isFolderNotFoundError(new Error("네트워크 오류"))).toBe(false);
  });

  it("404 응답은 첫 실패부터 재시도하지 않는다", () => {
    expect(
      shouldRetryFolderClipsQuery(
        0,
        new ApiError("폴더를 찾을 수 없습니다.", 404),
      ),
    ).toBe(false);
  });

  it("네트워크 오류와 5xx 응답은 기본 횟수만큼 재시도한다", () => {
    expect(shouldRetryFolderClipsQuery(0, new Error("네트워크 오류"))).toBe(
      true,
    );
    expect(
      shouldRetryFolderClipsQuery(2, new ApiError("서버 오류", 500)),
    ).toBe(true);
    expect(
      shouldRetryFolderClipsQuery(3, new ApiError("서버 오류", 500)),
    ).toBe(false);
  });
});
