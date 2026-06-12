export type ClipApiType = "TEXT" | "COLOR" | "IMAGE";

export interface ClipTagResponseDto {
  id: string;
  name: string;
}

export interface ClipListItemResponseDto {
  id: string;
  type: ClipApiType;
  title: string;
  textContent: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  workspaceId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  likeByMe: boolean;
  tags: ClipTagResponseDto[];
}

export interface ClipResponseDto {
  id: string;
  type: ClipApiType;
  title: string;
  textContent: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  workspaceId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClipCursorPageResponseDto {
  items: ClipListItemResponseDto[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface FetchClipsQueryDto {
  folderId?: string;
  favorite?: boolean;
  recent?: boolean;
  type?: "TEXT" | "COLOR" | "IMAGE" | "ALL";
  q?: string;
}

export interface CreateTextClipRequestDto {
  folderId: string;
  text: string;
}

export interface CreateImageClipRequestDto {
  folderId: string;
  file: File;
}

export interface LikeClipResponseDto {
  likeByMe: boolean;
}
