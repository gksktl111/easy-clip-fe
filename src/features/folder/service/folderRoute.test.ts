import { describe, expect, it } from "vitest";
import { getFolderPath } from "@/features/folder/service/folderRoute";

describe("getFolderPath", () => {
  it("폴더 식별자를 workspace 폴더 경로로 변환한다", () => {
    expect(getFolderPath("folder id")).toBe("/folder/folder%20id");
  });
});
