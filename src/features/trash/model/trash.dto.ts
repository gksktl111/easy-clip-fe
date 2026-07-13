export type TrashItemResponseDto =
  | {
      itemType: "CLIP";
      id: string;
      deletedAt: string | null;
      title: string;
      type: "TEXT" | "COLOR" | "IMAGE";
      folderId: string;
    }
  | {
      itemType: "FOLDER";
      id: string;
      deletedAt: string | null;
      name: string;
    };

export interface TrashListResponseDto {
  items: TrashItemResponseDto[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface TrashItemMutationDto {
  itemType: "CLIP" | "FOLDER";
  id: string;
}

export interface TrashRestoreResponseDto {
  restoredCount: number;
}

export interface TrashDeleteAllResponseDto {
  clipsDeleted: number;
  foldersDeleted: number;
  totalDeleted: number;
}
