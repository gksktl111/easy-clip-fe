import { describe, expect, it } from "vitest";
import type { ClipListItemResponseDto } from "@/features/clip/model/clip.dto";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";

describe("mapClipResponse", () => {
  it("목록 응답의 색상 태그를 클립 모델에 포함한다", () => {
    const response: ClipListItemResponseDto = {
      id: "clip-1",
      type: "TEXT",
      title: "클립",
      textContent: "내용",
      colorHex: null,
      imageUrl: null,
      workspaceId: "workspace-1",
      folderId: "folder-1",
      createdAt: "2026-09-06T00:00:00.000Z",
      updatedAt: "2026-09-06T00:00:00.000Z",
      deletedAt: null,
      likeByMe: false,
      tags: [{ id: "tag-1", name: "중요", backgroundColor: "RED" }],
    };

    expect(mapClipResponse(response).tags).toEqual([
      { id: "tag-1", name: "중요", backgroundColor: "RED" },
    ]);
  });
});
