import { describe, expect, it, vi } from "vitest";
import {
  createFolderTag,
  deleteFolderTag,
  fetchFolderTags,
  replaceClipTags,
  updateFolderTag,
} from "@/features/clip/api/tagApi";
import { apiRequest } from "@/shared/lib/apiClient";

vi.mock("@/shared/lib/apiClient", () => ({
  apiRequest: vi.fn(),
}));

describe("태그 API", () => {
  it("폴더별 태그 목록을 인코딩된 경로로 조회한다", () => {
    fetchFolderTags("folder/id");

    expect(apiRequest).toHaveBeenCalledWith("/folders/folder%2Fid/tags", {
      cache: "no-store",
    });
  });

  it("새 태그 이름과 색상을 JSON으로 생성한다", () => {
    createFolderTag("folder-1", {
      name: " 중요 ",
      backgroundColor: "RED",
    });

    expect(apiRequest).toHaveBeenCalledWith("/folders/folder-1/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: " 중요 ", backgroundColor: "RED" }),
    });
  });

  it("바뀐 태그 필드만 수정 요청에 포함한다", () => {
    updateFolderTag("folder-1", "tag/1", { backgroundColor: "BLUE" });

    expect(apiRequest).toHaveBeenCalledWith("/folders/folder-1/tags/tag%2F1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundColor: "BLUE" }),
    });
  });

  it("폴더 태그를 삭제한다", () => {
    deleteFolderTag("folder-1", "tag-1");

    expect(apiRequest).toHaveBeenCalledWith("/folders/folder-1/tags/tag-1", {
      method: "DELETE",
    });
  });

  it("선택한 이름 전체를 클립 태그 교체 요청으로 보낸다", () => {
    replaceClipTags("clip/1", { tags: ["Tag", " tag "] });

    expect(apiRequest).toHaveBeenCalledWith("/clips/clip%2F1/tags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: ["Tag", " tag "] }),
    });
  });
});
