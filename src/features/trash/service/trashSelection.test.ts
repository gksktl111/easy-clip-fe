import { describe, expect, it } from "vitest";
import type { TrashItemRow } from "@/features/trash/model/trashRow";
import {
  getSelectedTrashRows,
  mapTrashRowsToMutationItems,
  reconcileTrashRowSelection,
  toggleAllTrashRowSelection,
  toggleTrashRowSelection,
} from "@/features/trash/service/trashSelection";

const rows: TrashItemRow[] = [
  {
    kind: "folder",
    id: "folder-1",
    name: "프로젝트",
    deletedAt: null,
    typeLabel: "폴더",
  },
  {
    kind: "clip",
    id: "clip-1",
    name: "메모",
    deletedAt: null,
    typeLabel: "파일 · 텍스트",
    clipType: "TEXT",
    parentFolderName: "프로젝트",
  },
];

describe("trashSelection", () => {
  it("행을 토글할 때 기존 선택을 변경하지 않고 새 선택 집합을 반환한다", () => {
    const selectedRowKeys = new Set(["folder-folder-1"]);

    const nextKeys = toggleTrashRowSelection(selectedRowKeys, rows[1]);

    expect([...selectedRowKeys]).toEqual(["folder-folder-1"]);
    expect([...nextKeys]).toEqual(["folder-folder-1", "clip-clip-1"]);
  });

  it("전체 선택과 전체 선택 해제를 전환한다", () => {
    const allSelected = toggleAllTrashRowSelection(new Set(), rows);

    expect([...allSelected]).toEqual(["folder-folder-1", "clip-clip-1"]);
    expect(toggleAllTrashRowSelection(allSelected, rows)).toEqual(new Set());
  });

  it("목록에서 사라진 선택 키만 정리한다", () => {
    const selectedRowKeys = new Set(["folder-folder-1", "clip-removed"]);

    expect(reconcileTrashRowSelection(selectedRowKeys, rows)).toEqual(
      new Set(["folder-folder-1"]),
    );
    expect(reconcileTrashRowSelection(new Set(["clip-clip-1"]), rows)).toEqual(
      new Set(["clip-clip-1"]),
    );
  });

  it("선택 행을 목록 순서로 복원·영구 삭제 API payload로 변환한다", () => {
    const selectedRows = getSelectedTrashRows(
      rows,
      new Set(["clip-clip-1", "folder-folder-1"]),
    );

    expect(mapTrashRowsToMutationItems(selectedRows)).toEqual([
      { itemType: "FOLDER", id: "folder-1" },
      { itemType: "CLIP", id: "clip-1" },
    ]);
  });
});
