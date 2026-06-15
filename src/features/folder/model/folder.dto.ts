export interface FolderResponseDto {
  id: string;
  name: string;
  order: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateFolderRequestDto {
  name: string;
}

export interface UpdateFolderRequestDto {
  name: string;
}

export interface ReorderFolderRequestDto {
  targetId: string;
  beforeId?: string;
  afterId?: string;
}
