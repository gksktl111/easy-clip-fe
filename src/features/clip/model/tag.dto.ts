import type { TagBackgroundColor } from "@/features/clip/model/tag";

export interface ClipTagResponseDto {
  id: string;
  name: string;
  backgroundColor: TagBackgroundColor;
}

export interface FolderTagResponseDto extends ClipTagResponseDto {
  folderId: string;
}

export interface CreateFolderTagRequestDto {
  name: string;
  backgroundColor?: TagBackgroundColor;
}

export interface UpdateFolderTagRequestDto {
  name?: string;
  backgroundColor?: TagBackgroundColor;
}

export interface ReplaceClipTagsRequestDto {
  tags: string[];
}

export interface ReplaceClipTagsResponseDto {
  tags: ClipTagResponseDto[];
}
