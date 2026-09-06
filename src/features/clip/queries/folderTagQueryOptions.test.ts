import { describe, expect, it } from "vitest";
import { folderTagQueryOptions } from "@/features/clip/queries/folderTagQueryOptions";
import { ApiError } from "@/shared/lib/apiClient";

describe("folderTagQueryOptions", () => {
  it("folderId를 포함한 query key를 사용한다", () => {
    const options = folderTagQueryOptions({
      enabled: true,
      folderId: "folder-1",
    });

    expect(options.queryKey).toEqual(["folder-tags", "folder-1"]);
  });

  it("404는 재시도하지 않고 일시적 오류만 기본 횟수만큼 재시도한다", () => {
    const options = folderTagQueryOptions({
      enabled: true,
      folderId: "folder-1",
    });
    const { retry } = options;

    if (typeof retry !== "function") {
      throw new Error("폴더 태그 조회 재시도 정책이 없습니다.");
    }

    expect(retry(0, new ApiError("없음", 404))).toBe(false);
    expect(retry(2, new ApiError("서버 오류", 500))).toBe(true);
    expect(retry(3, new ApiError("서버 오류", 500))).toBe(false);
  });
});
