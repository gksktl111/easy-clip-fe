import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/lib/apiClient";
import { clipInfiniteQueryOptions } from "@/features/clip/queries/clipInfiniteQueryOptions";

describe("clipInfiniteQueryOptions", () => {
  it("폴더 조회의 404 응답은 재시도하지 않는다", () => {
    const options = clipInfiniteQueryOptions({
      enabled: true,
      filter: "all",
      folderId: "missing-folder",
    });
    const { retry } = options;

    if (typeof retry !== "function") {
      throw new Error("폴더 조회의 재시도 정책이 설정되지 않았습니다.");
    }

    expect(retry(0, new ApiError("폴더를 찾을 수 없습니다.", 404))).toBe(false);
  });

  it("최근·즐겨찾기 조회도 정책 오류는 재시도하지 않는다", () => {
    const options = clipInfiniteQueryOptions({
      enabled: true,
      filter: "all",
    });

    expect(typeof options.retry).toBe("function");
    if (typeof options.retry === "function") {
      expect(
        options.retry(0, new ApiError("잠금", 403, "PROJECT_LOCKED")),
      ).toBe(false);
      expect(options.retry(0, new ApiError("오류", 500))).toBe(true);
    }
  });
});
