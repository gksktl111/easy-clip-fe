import { describe, expect, it } from "vitest";
import type { TrashItemResponseDto } from "@/features/trash/model/trash.dto";
import {
  createTrashFolderNameById,
  mapTrashItemsToRows,
} from "@/features/trash/service/trashRowMapper";

const labels = {
  folderType: "폴더",
  fileType: "파일",
  unknownParentFolder: "알 수 없는 상위 폴더",
  clipTypes: {
    TEXT: "텍스트",
    COLOR: "색상",
    IMAGE: "이미지",
  },
};

const items: TrashItemResponseDto[] = [
  {
    itemType: "FOLDER",
    id: "folder-deleted",
    name: "삭제된 폴더",
    deletedAt: "2026-08-18T00:00:00.000Z",
  },
  {
    itemType: "CLIP",
    id: "clip-in-deleted-folder",
    title: "폴더에 포함된 클립",
    type: "TEXT",
    folderId: "folder-deleted",
    deletedAt: "2026-08-18T00:00:00.000Z",
  },
  {
    itemType: "CLIP",
    id: "clip-in-active-folder",
    title: "활성 폴더 클립",
    type: "COLOR",
    folderId: "folder-active",
    deletedAt: "2026-08-18T00:00:00.000Z",
  },
  {
    itemType: "CLIP",
    id: "clip-without-parent",
    title: "상위 폴더를 찾을 수 없는 클립",
    type: "IMAGE",
    folderId: "folder-missing",
    deletedAt: null,
  },
];

describe("trashRowMapper", () => {
  it("활성 폴더와 휴지통 폴더의 이름을 명시적인 맵으로 결합한다", () => {
    const folderNameById = createTrashFolderNameById(
      [{ id: "folder-active", name: "활성 폴더" }],
      items,
    );

    expect([...folderNameById]).toEqual([
      ["folder-active", "활성 폴더"],
      ["folder-deleted", "삭제된 폴더"],
    ]);
  });

  it("삭제된 폴더에 포함된 클립은 제외하고 나머지 DTO를 화면 행으로 변환한다", () => {
    const folderNameById = createTrashFolderNameById(
      [{ id: "folder-active", name: "활성 폴더" }],
      items,
    );

    expect(mapTrashItemsToRows(items, { folderNameById, labels })).toEqual([
      {
        kind: "folder",
        id: "folder-deleted",
        name: "삭제된 폴더",
        deletedAt: "2026-08-18T00:00:00.000Z",
        typeLabel: "폴더",
      },
      {
        kind: "clip",
        id: "clip-in-active-folder",
        name: "활성 폴더 클립",
        deletedAt: "2026-08-18T00:00:00.000Z",
        typeLabel: "파일 · 색상",
        clipType: "COLOR",
        parentFolderName: "활성 폴더",
      },
      {
        kind: "clip",
        id: "clip-without-parent",
        name: "상위 폴더를 찾을 수 없는 클립",
        deletedAt: null,
        typeLabel: "파일 · 이미지",
        clipType: "IMAGE",
        parentFolderName: "알 수 없는 상위 폴더",
      },
    ]);
  });
});
