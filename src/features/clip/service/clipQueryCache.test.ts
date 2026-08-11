import { QueryClient } from "@tanstack/react-query";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type {
  ClipCursorPageResponseDto,
  ClipListItemResponseDto,
} from "@/features/clip/model/clip.dto";
import {
  addOptimisticClipToCache,
  CLIP_QUERY_KEY,
  moveClipToRecentCache,
  removeClipsFromCache,
  replaceOptimisticClipInCache,
  updateClipFavoriteCache,
} from "@/features/clip/service/clipQueryCache";

type ClipQueryOptions = {
  favorite?: boolean;
  folderId?: string | null;
  q?: string;
  recent?: boolean;
  type?: "TEXT" | "COLOR" | "IMAGE" | "ALL";
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const createClip = (
  id: string,
  overrides: Partial<ClipListItemResponseDto> = {},
): ClipListItemResponseDto => ({
  id,
  type: "TEXT",
  title: id,
  textContent: `${id} text`,
  colorHex: null,
  imageUrl: null,
  workspaceId: "workspace-1",
  folderId: "folder-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  likeByMe: false,
  tags: [],
  ...overrides,
});

const createInfiniteData = (
  ...pages: ClipListItemResponseDto[][]
): InfiniteData<ClipCursorPageResponseDto> => ({
  pages: pages.map((items, index) => ({
    items,
    hasMore: index < pages.length - 1,
    nextCursor: index < pages.length - 1 ? `cursor-${index + 1}` : null,
  })),
  pageParams: pages.map((_, index) => (index === 0 ? null : `cursor-${index}`)),
});

const createClipQueryKey = (options: ClipQueryOptions = {}) =>
  [
    CLIP_QUERY_KEY,
    {
      folderId: null,
      favorite: false,
      recent: false,
      type: "ALL" as const,
      q: "",
      ...options,
    },
  ] as const;

const setClipQueryData = (
  queryClient: QueryClient,
  options: ClipQueryOptions,
  ...pages: ClipListItemResponseDto[][]
) => {
  const queryKey = createClipQueryKey(options);

  queryClient.setQueryData(queryKey, createInfiniteData(...pages));

  return queryKey;
};

const getClipQueryData = (queryClient: QueryClient, queryKey: QueryKey) => {
  const data = queryClient.getQueryData<
    InfiniteData<ClipCursorPageResponseDto>
  >(queryKey);

  if (!data) {
    throw new Error("클립 쿼리 캐시가 없습니다.");
  }

  return data;
};

const getClipIdsByPage = (queryClient: QueryClient, queryKey: QueryKey) =>
  getClipQueryData(queryClient, queryKey).pages.map((page) =>
    page.items.map((clip) => clip.id),
  );

describe("clipQueryCache", () => {
  it("즐겨찾기 추가 시 일반 폴더 목록을 갱신하고 즐겨찾기 목록에 삽입한다", () => {
    const queryClient = createQueryClient();
    const clip = createClip("clip-1");
    const folderQueryKey = setClipQueryData(
      queryClient,
      { folderId: "folder-1" },
      [clip],
    );
    const favoriteQueryKey = setClipQueryData(queryClient, { favorite: true }, []);

    updateClipFavoriteCache(queryClient, clip.id, true);

    expect(getClipQueryData(queryClient, folderQueryKey).pages[0]?.items[0])
      .toMatchObject({ id: clip.id, likeByMe: true });
    expect(getClipQueryData(queryClient, favoriteQueryKey).pages[0]?.items[0])
      .toMatchObject({ id: clip.id, likeByMe: true });
  });

  it("즐겨찾기 제거 시 일반 폴더 목록을 갱신하고 즐겨찾기 목록에서 제거한다", () => {
    const queryClient = createQueryClient();
    const clip = createClip("clip-1", { likeByMe: true });
    const folderQueryKey = setClipQueryData(
      queryClient,
      { folderId: "folder-1" },
      [clip],
    );
    const favoriteQueryKey = setClipQueryData(queryClient, { favorite: true }, [clip]);

    updateClipFavoriteCache(queryClient, clip.id, false);

    expect(getClipQueryData(queryClient, folderQueryKey).pages[0]?.items[0])
      .toMatchObject({ id: clip.id, likeByMe: false });
    expect(getClipIdsByPage(queryClient, favoriteQueryKey)).toEqual([[]]);
  });

  it("폴더, 타입, 검색어 조건에 맞지 않는 optimistic 클립은 삽입하지 않는다", () => {
    const queryClient = createQueryClient();
    const matchingQueryKey = setClipQueryData(
      queryClient,
      { folderId: "folder-1", type: "TEXT", q: "alpha" },
      [],
    );
    const otherFolderQueryKey = setClipQueryData(
      queryClient,
      { folderId: "folder-2" },
      [createClip("folder-clip", { folderId: "folder-2" })],
    );
    const otherTypeQueryKey = setClipQueryData(
      queryClient,
      { type: "IMAGE" },
      [createClip("image-clip", { type: "IMAGE" })],
    );
    const otherSearchQueryKey = setClipQueryData(
      queryClient,
      { q: "beta" },
      [createClip("beta-clip", { title: "Beta" })],
    );
    const optimisticClip = createClip("optimistic-clip", {
      title: "Alpha note",
      textContent: "matched content",
      isOptimistic: true,
    });

    addOptimisticClipToCache(queryClient, optimisticClip);

    expect(getClipIdsByPage(queryClient, matchingQueryKey)).toEqual([
      [optimisticClip.id],
    ]);
    expect(getClipIdsByPage(queryClient, otherFolderQueryKey)).toEqual([
      ["folder-clip"],
    ]);
    expect(getClipIdsByPage(queryClient, otherTypeQueryKey)).toEqual([
      ["image-clip"],
    ]);
    expect(getClipIdsByPage(queryClient, otherSearchQueryKey)).toEqual([
      ["beta-clip"],
    ]);
  });

  it("서버 응답이 이미 캐시에 있으면 optimistic 클립으로 교체하고 기존 항목을 제거한다", () => {
    const queryClient = createQueryClient();
    const optimisticClip = createClip("optimistic-clip", {
      isOptimistic: true,
    });
    const savedClip = createClip("saved-clip", { title: "Saved clip" });
    const folderQueryKey = setClipQueryData(
      queryClient,
      { folderId: "folder-1" },
      [createClip("existing-clip")],
      [savedClip],
    );

    addOptimisticClipToCache(queryClient, optimisticClip);
    replaceOptimisticClipInCache(queryClient, optimisticClip.id, savedClip);

    expect(getClipIdsByPage(queryClient, folderQueryKey)).toEqual([
      [savedClip.id, "existing-clip"],
      [],
    ]);
  });

  it("삭제 rollback은 각 페이지의 기존 클립 순서를 복원한다", () => {
    const queryClient = createQueryClient();
    const queryKey = setClipQueryData(
      queryClient,
      {},
      [createClip("first"), createClip("deleted-first"), createClip("last")],
      [createClip("page-two-first"), createClip("deleted-second")],
    );

    const rollback = removeClipsFromCache(queryClient, [
      "deleted-first",
      "deleted-second",
    ]);

    expect(getClipIdsByPage(queryClient, queryKey)).toEqual([
      ["first", "last"],
      ["page-two-first"],
    ]);

    rollback();

    expect(getClipIdsByPage(queryClient, queryKey)).toEqual([
      ["first", "deleted-first", "last"],
      ["page-two-first", "deleted-second"],
    ]);
  });

  it("복사한 클립은 recent 캐시의 첫 페이지로 이동하며 기존 중복은 제거한다", () => {
    const queryClient = createQueryClient();
    const copiedClip = createClip("copied-clip");
    setClipQueryData(queryClient, {}, [copiedClip]);
    const recentQueryKey = setClipQueryData(
      queryClient,
      { recent: true },
      [createClip("recent-first")],
      [copiedClip, createClip("recent-second")],
    );

    moveClipToRecentCache(queryClient, copiedClip.id);

    expect(getClipIdsByPage(queryClient, recentQueryKey)).toEqual([
      [copiedClip.id, "recent-first"],
      ["recent-second"],
    ]);
  });
});
