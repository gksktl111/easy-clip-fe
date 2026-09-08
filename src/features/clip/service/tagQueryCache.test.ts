import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { ClipCursorPageResponseDto } from "@/features/clip/model/clip.dto";
import type { FolderTag } from "@/features/clip/model/tag";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";
import {
  addFolderTagToCache,
  folderTagQueryKeys,
  removeFolderTagFromCache,
  updateClipTagsInCache,
  updateFolderTagInCache,
} from "@/features/clip/service/tagQueryCache";

const redTag: FolderTag = {
  id: "tag-1",
  name: "중요",
  backgroundColor: "RED",
  folderId: "folder-1",
};

describe("태그 query cache", () => {
  it("폴더 태그 생성·수정·삭제 결과를 해당 폴더 캐시에 반영한다", () => {
    const queryClient = new QueryClient();
    const queryKey = folderTagQueryKeys.list("folder-1");

    addFolderTagToCache(queryClient, redTag);
    expect(queryClient.getQueryData(queryKey)).toEqual([redTag]);

    const updatedTag = {
      ...redTag,
      name: "업무",
      backgroundColor: "BLUE" as const,
    };
    updateFolderTagInCache(queryClient, updatedTag);
    expect(queryClient.getQueryData(queryKey)).toEqual([updatedTag]);

    removeFolderTagFromCache(queryClient, "folder-1", redTag.id);
    expect(queryClient.getQueryData(queryKey)).toEqual([]);
  });

  it("클립 태그 저장 응답을 모든 클립 목록 캐시에 즉시 반영한다", () => {
    const queryClient = new QueryClient();
    const queryKey = clipQueryKeys.list({ folderId: "folder-1" });
    const page: ClipCursorPageResponseDto = {
      items: [
        {
          id: "clip-1",
          type: "TEXT",
          title: "테스트",
          textContent: "내용",
          colorHex: null,
          imageUrl: null,
          workspaceId: "workspace-1",
          folderId: "folder-1",
          createdAt: "2026-09-06T00:00:00.000Z",
          updatedAt: "2026-09-06T00:00:00.000Z",
          deletedAt: null,
          likeByMe: false,
          tags: [],
        },
      ],
      hasMore: false,
      nextCursor: null,
    };
    queryClient.setQueryData(queryKey, { pages: [page], pageParams: [null] });

    updateClipTagsInCache(queryClient, "clip-1", [
      { id: "tag-1", name: "중요", backgroundColor: "RED" },
    ]);

    expect(
      queryClient.getQueryData<{ pages: ClipCursorPageResponseDto[] }>(queryKey)
        ?.pages[0]?.items[0]?.tags,
    ).toEqual([{ id: "tag-1", name: "중요", backgroundColor: "RED" }]);
  });
});
