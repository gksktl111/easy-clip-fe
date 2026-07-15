import { describe, expect, it } from "vitest";
import type { FolderItem } from "@/features/folder/model/folder";
import {
  getFolderKeyboardMoveTarget,
  reorderFolderItems,
} from "@/features/folder/service/folderCollection";

const folders: FolderItem[] = [
  { id: "alpha", name: "Alpha", order: 0 },
  { id: "beta", name: "Beta", order: 1 },
  { id: "gamma", name: "Gamma", order: 2 },
];

describe("getFolderKeyboardMoveTarget", () => {
  it("위 이동은 이전 폴더 앞에 놓는 대상으로 계산한다", () => {
    expect(getFolderKeyboardMoveTarget(folders, "beta", "up")).toEqual({
      targetId: "alpha",
      position: "before",
    });
  });

  it("아래 이동은 다음 폴더 뒤에 놓는 대상으로 계산한다", () => {
    expect(getFolderKeyboardMoveTarget(folders, "beta", "down")).toEqual({
      targetId: "gamma",
      position: "after",
    });
  });

  it("첫 폴더의 위 이동과 마지막 폴더의 아래 이동은 무시한다", () => {
    expect(getFolderKeyboardMoveTarget(folders, "alpha", "up")).toBeNull();
    expect(getFolderKeyboardMoveTarget(folders, "gamma", "down")).toBeNull();
  });

  it("계산한 대상으로 실제 폴더 순서를 변경할 수 있다", () => {
    const target = getFolderKeyboardMoveTarget(folders, "beta", "down");

    expect(target).not.toBeNull();
    expect(
      reorderFolderItems(
        folders,
        "beta",
        target?.targetId ?? "",
        target?.position ?? "after",
      ).map((folder) => folder.id),
    ).toEqual(["alpha", "gamma", "beta"]);
  });
});
