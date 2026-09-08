import type { TrashItemResponseDto } from "@/features/trash/model/trash.dto";

export type TrashClipType = Extract<
  TrashItemResponseDto,
  { itemType: "CLIP" }
>["type"];

export type TrashItemRow =
  | {
      kind: "folder";
      id: string;
      name: string;
      deletedAt: string | null;
      typeLabel: string;
    }
  | {
      kind: "clip";
      id: string;
      name: string;
      deletedAt: string | null;
      typeLabel: string;
      clipType: TrashClipType;
      parentFolderName: string;
    };

export const getTrashRowKey = (row: TrashItemRow) =>
  `${row.kind}-${row.id}`;
