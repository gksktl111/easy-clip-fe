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

    expect(retry(0, new ApiError("폴더를 찾을 수 없습니다.", 404))).toBe(
      false,
    );
  });

  it("폴더가 아닌 클립 조회에는 기존 재시도 정책을 유지한다", () => {
    const options = clipInfiniteQueryOptions({
      enabled: true,
      filter: "all",
    });

    expect(options.retry).toBeUndefined();
  });
});
