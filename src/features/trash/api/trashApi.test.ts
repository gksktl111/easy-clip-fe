import { beforeEach, describe, expect, it, vi } from "vitest";
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/shared/lib/apiClient", () => ({ apiRequest: request }));
import {
  restoreTrashItems,
  deleteTrashItems,
  restoreTrashFolder,
  deleteAllTrashItems,
} from "./trashApi";
beforeEach(() => request.mockReset());
describe("휴지통 변경 요청 계약", () => {
  it.each([restoreTrashItems, deleteTrashItems])(
    "동일 종류·ID만 중복 제거하고 같은 ID의 다른 종류는 유지한다",
    async (action) => {
      await action([
        { itemType: "FOLDER", id: "same" },
        { itemType: "FOLDER", id: "same" },
        { itemType: "CLIP", id: "same" },
      ]);
      expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({
        items: [
          { itemType: "FOLDER", id: "same" },
          { itemType: "CLIP", id: "same" },
        ],
      });
    },
  );
  it("폴더만 복구할 때 자식 클립을 요청에 추가하지 않는다", async () => {
    await restoreTrashFolder("folder");
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({
      items: [{ itemType: "FOLDER", id: "folder" }],
    });
  });
  it("전체 비우기는 화면 선택이나 항목 수를 본문으로 보내지 않는다", async () => {
    await deleteAllTrashItems();
    expect(request).toHaveBeenCalledWith("/trash", { method: "DELETE" });
  });
});
