import type {
  TrashClipType,
  TrashItemRow,
} from "@/features/trash/model/trashRow";
import type { TrashItemResponseDto } from "@/features/trash/model/trash.dto";

export interface TrashFolderReference {
  id: string;
  name: string;
}

export interface TrashRowLabels {
  folderType: string;
  fileType: string;
  unknownParentFolder: string;
  clipTypes: Record<TrashClipType, string>;
}

interface MapTrashItemsToRowsOptions {
  folderNameById: ReadonlyMap<string, string>;
  labels: TrashRowLabels;
}

// 활성 폴더와 현재 조회된 휴지통 폴더를 하나의 부모 폴더 이름 맵으로 결합합니다.
export const createTrashFolderNameById = (
  activeFolders: readonly TrashFolderReference[],
  items: readonly TrashItemResponseDto[],
) => {
  const folderNameById = new Map(
    activeFolders.map((folder) => [folder.id, folder.name] as const),
  );

  items.forEach((item) => {
    if (item.itemType === "FOLDER") {
      folderNameById.set(item.id, item.name);
    }
  });

  return folderNameById;
};

// 휴지통 DTO를 화면 행으로 변환하고, 삭제된 부모 폴더에 포함된 클립의 중복 표시는 제외합니다.
export const mapTrashItemsToRows = (
  items: readonly TrashItemResponseDto[],
  { folderNameById, labels }: MapTrashItemsToRowsOptions,
): TrashItemRow[] => {
  const deletedFolderIds = new Set(
    items
      .filter((item) => item.itemType === "FOLDER")
      .map((folder) => folder.id),
  );
  const rows: TrashItemRow[] = [];

  items.forEach((item) => {
    if (item.itemType === "FOLDER") {
      rows.push({
        kind: "folder",
        id: item.id,
        name: item.name,
        deletedAt: item.deletedAt,
        typeLabel: labels.folderType,
      });
      return;
    }

    if (deletedFolderIds.has(item.folderId)) {
      return;
    }

    rows.push({
      kind: "clip",
      id: item.id,
      name: item.title,
      deletedAt: item.deletedAt,
      typeLabel: `${labels.fileType} · ${labels.clipTypes[item.type]}`,
      clipType: item.type,
      parentFolderName:
        folderNameById.get(item.folderId) ?? labels.unknownParentFolder,
    });
  });

  return rows;
};
