export type TrashItemResponseDto =
  | {
      itemType: "CLIP";
      id: string;
      deletedAt: string | null;
      title: string;
      type: "TEXT" | "COLOR" | "IMAGE";
      folderId: string;
      // 본문을 제공하는 서버 응답과 호환하며, 기존 서버에서는 생략됩니다.
      textContent?: string | null;
      imageUrl?: string | null;
      colorHex?: string | null;
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
