import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { ClipCursorPageResponseDto } from "@/features/clip/model/clip.dto";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";
import {
  optimisticallyUpdateClipFavorite,
  restoreClipFavorite,
} from "./clipFavoriteQueryCache";
import { updateClipTagsInCache } from "./tagQueryCache";

const makeData = (): InfiniteData<ClipCursorPageResponseDto> => ({
  pages: [1, 2, 3].map((n) => ({
    items: [
      {
        id: `clip-${n}`,
        type: "TEXT",
        title: `클립 ${n}`,
        textContent: "내용",
        colorHex: null,
        imageUrl: null,
        workspaceId: "workspace-1",
        folderId: "folder-1",
        createdAt: "2026-09-08T00:00:00.000Z",
        updatedAt: "2026-09-08T00:00:00.000Z",
        deletedAt: null,
        likeByMe: false,
        tags: [],
      },
    ],
    hasMore: n < 3,
    nextCursor: n < 3 ? String(n) : null,
  })),
  pageParams: [null, "1", "2"],
});

describe("즐겨찾기 낙관적 캐시 갱신", () => {
  it("여러 목록의 기존 항목만 갱신하고 페이지와 cursor를 보존한다", () => {
    const client = new QueryClient();
    const keys = [
      clipQueryKeys.list({ recent: true }),
      clipQueryKeys.list({ folderId: "folder-1" }),
    ];
    const original = makeData();
    for (const key of keys) client.setQueryData(key, original);
    const emptyKey = clipQueryKeys.list({ favorite: true });
    client.setQueryData(emptyKey, { pages: [], pageParams: [] });
    optimisticallyUpdateClipFavorite(client, "clip-2", true);
    for (const key of keys) {
      const result =
        client.getQueryData<InfiniteData<ClipCursorPageResponseDto>>(key)!;
      expect(result.pages).toHaveLength(3);
      expect(result.pageParams).toEqual(original.pageParams);
      expect(result.pages.map((p) => [p.hasMore, p.nextCursor])).toEqual(
        original.pages.map((p) => [p.hasMore, p.nextCursor]),
      );
      expect(
        result.pages.flatMap((p) => p.items).map((c) => c.likeByMe),
      ).toEqual([false, true, false]);
    }
    expect(original.pages[1].items[0].likeByMe).toBe(false);
    expect(client.getQueryData(emptyKey)).toEqual({
      pages: [],
      pageParams: [],
    });
  });

  it("실패 시 대상 값만 복구하고 동시에 성공한 태그와 다른 클립 변경을 유지한다", () => {
    const client = new QueryClient();
    const key = clipQueryKeys.list({ recent: true });
    client.setQueryData(key, makeData());
    const snapshot = optimisticallyUpdateClipFavorite(client, "clip-2", true);
    optimisticallyUpdateClipFavorite(client, "clip-3", true);
    const tags = [
      { id: "tag-1", name: "중요", backgroundColor: "RED" as const },
    ];
    updateClipTagsInCache(client, "clip-2", tags);
    restoreClipFavorite(client, "clip-2", snapshot);
    const data =
      client.getQueryData<InfiniteData<ClipCursorPageResponseDto>>(key)!;
    expect(data.pages[1].items[0].likeByMe).toBe(false);
    expect(data.pages[1].items[0].tags).toEqual(tags);
    expect(data.pages[2].items[0].likeByMe).toBe(true);
    expect(data.pageParams).toEqual([null, "1", "2"]);
    client.removeQueries({ queryKey: key, exact: true });
    restoreClipFavorite(client, "clip-2", snapshot);
    expect(client.getQueryData(key)).toBeUndefined();
  });
});
