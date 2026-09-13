import { describe, expect, it } from "vitest";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

describe("clipQueryKeys", () => {
  it("전체 key와 목록 조건을 일관되게 생성한다", () => {
    expect(clipQueryKeys.all).toEqual(["clips"]);
    expect(
      clipQueryKeys.list({
        folderId: "folder-1",
        favorite: true,
        q: "  meeting  ",
      }),
    ).toEqual([
      "clips",
      {
        folderId: "folder-1",
        favorite: true,
        recent: false,
        type: "ALL",
        q: "meeting",
      },
    ]);
  });
});

describe("열람 기록 후 무효화 범위", () => {
  it("최근 목록만 재조회하고 폴더·즐겨찾기는 유지한다", async () => {
    const { QueryClient, QueryObserver } =
      await import("@tanstack/react-query");
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity } },
    });
    const calls = [0, 0, 0];
    const keys = [
      clipQueryKeys.list({ folderId: "a", accessScope: "user:1" }),
      clipQueryKeys.list({ favorite: true, accessScope: "user:1" }),
      clipQueryKeys.list({ recent: true, accessScope: "user:1" }),
    ];
    const unsubscribe = keys.map((queryKey, i) => {
      client.setQueryData(queryKey, []);
      return new QueryObserver(client, {
        queryKey,
        queryFn: async () => {
          calls[i]++;
          return [];
        },
      }).subscribe(() => {});
    });
    const inactiveRecent = clipQueryKeys.list({
      recent: true,
      q: "검색",
      accessScope: "user:2",
    });
    client.setQueryData(inactiveRecent, []);
    try {
      await client.invalidateQueries({ queryKey: clipQueryKeys.all });
      expect(calls).toEqual([1, 1, 1]);
      calls.fill(0);
      client.setQueryData(inactiveRecent, []);
      await client.invalidateQueries({ queryKey: clipQueryKeys.recent });
      expect(calls).toEqual([0, 0, 1]);
      expect(client.getQueryState(inactiveRecent)?.isInvalidated).toBe(true);
      expect(client.getQueryState(keys[0])?.isInvalidated).toBe(false);
      expect(client.getQueryState(keys[1])?.isInvalidated).toBe(false);
    } finally {
      unsubscribe.forEach((stop) => stop());
      client.clear();
    }
  });
});
