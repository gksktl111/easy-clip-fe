import { ClipApiType } from "@/features/clip/model/clip.dto";

export interface TrashClipResponseDto {
  id: string;
  title: string;
  type: ClipApiType;
  folderId: string;
  deletedAt: string | null;
}

export interface TrashClipListResponseDto {
  items: TrashClipResponseDto[];
}

export interface TrashFolderResponseDto {
  id: string;
  name: string;
  deletedAt: string | null;
}

export interface TrashFolderListResponseDto {
  items: TrashFolderResponseDto[];
}

export interface TrashDeleteResponseDto {
  success: boolean;
}
