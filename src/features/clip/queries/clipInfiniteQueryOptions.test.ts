import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { fetchClips } from "@/features/clip/api/clipApi";
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

vi.mock("@/features/clip/api/clipApi", () => ({ fetchClips: vi.fn() }));

for (const fails of [false, true]) {
  it(`응답 ${fails ? "실패" : "성공"} 뒤 타이머 대기 없이 조회를 마친다`, async () => {
    vi.useFakeTimers();
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retry: false } },
    });
    const error = new ApiError("조회 거부", 403);
    const response = { items: [], hasMore: false, nextCursor: null };
    if (fails) vi.mocked(fetchClips).mockRejectedValue(error);
    else vi.mocked(fetchClips).mockResolvedValue(response);
    try {
      const pending = client.fetchInfiniteQuery(
        clipInfiniteQueryOptions({
          enabled: true,
          filter: "all",
          folderId: "a",
        }),
      );
      if (fails) await expect(pending).rejects.toBe(error);
      else await expect(pending).resolves.toMatchObject({ pages: [response] });
      expect(vi.getTimerCount()).toBe(0);
      expect(fetchClips).toHaveBeenCalledWith(
        expect.objectContaining({ folderId: "a", cursor: null }),
        expect.any(AbortSignal),
      );
    } finally {
      client.clear();
      vi.useRealTimers();
    }
  });
}
