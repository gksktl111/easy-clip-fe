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
