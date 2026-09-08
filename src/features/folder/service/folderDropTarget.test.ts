import { describe, expect, it } from "vitest";
import { getFolderDropTarget } from "./folderDropTarget";
import {
  getFolderKeyboardMoveTarget,
  reorderFolderItems,
} from "./folderCollection";

const folders = ["a", "b", "c"].map((id, order) => ({ id, name: id, order }));

describe("폴더 행 드롭 위치", () => {
  it.each([
    ["c", "b", "before", "top", ["a", "c", "b"]],
    ["b", "c", "after", "bottom", ["a", "c", "b"]],
    ["c", "a", "before", "top", ["c", "a", "b"]],
    ["a", "c", "after", "bottom", ["b", "c", "a"]],
  ] as const)(
    "%s를 %s에 놓으면 올바른 위치로 이동한다",
    (source, target, position, edge, expected) => {
      const drop = getFolderDropTarget(folders, source, target)!;
      expect(drop).toEqual({
        targetId: target,
        position,
        indicatorFolderId: target,
        indicatorEdge: edge,
      });
      expect(
        reorderFolderItems(folders, source, drop.targetId, drop.position).map(
          (f) => f.id,
        ),
      ).toEqual(expected);
    },
  );

  it.each([
    [null, "a"],
    ["a", "a"],
    ["missing", "a"],
    ["a", "missing"],
  ])("잘못된 드롭 %s → %s는 무시한다", (source, target) => {
    expect(getFolderDropTarget(folders, source, target!)).toBeNull();
  });

  it("폴더가 두 개일 때 마지막 행 위 이동은 키보드와 같은 위치를 사용한다", () => {
    const pair = folders.slice(0, 2);
    const drop = getFolderDropTarget(pair, "b", "a")!;
    expect({ targetId: drop.targetId, position: drop.position }).toEqual(
      getFolderKeyboardMoveTarget(pair, "b", "up"),
    );
    expect(
      reorderFolderItems(pair, "b", drop.targetId, drop.position).map(
        (f) => f.id,
      ),
    ).toEqual(["b", "a"]);
  });
});
