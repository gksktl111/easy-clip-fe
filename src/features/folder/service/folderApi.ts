import { apiRequest } from "@/shared/lib/apiClient";

export interface FolderResponseDto {
  id: string;
  name: string;
  order: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const fetchFolders = (accessToken: string) =>
  apiRequest<FolderResponseDto[]>("/folders", {
    accessToken,
    cache: "no-store",
  });

export const createFolder = (accessToken: string, name: string) =>
  apiRequest<FolderResponseDto>("/folders", {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

export const updateFolder = (
  accessToken: string,
  folderId: string,
  name: string,
) =>
  apiRequest<FolderResponseDto>(`/folders/${folderId}`, {
    method: "PATCH",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

export const deleteFolder = (accessToken: string, folderId: string) =>
  apiRequest<FolderResponseDto>(`/folders/${folderId}`, {
    method: "DELETE",
    accessToken,
  });

export const reorderFolder = (
  accessToken: string,
  payload: {
    targetId: string;
    beforeId?: string;
    afterId?: string;
  },
) =>
  apiRequest<FolderResponseDto>("/folders/reorder", {
    method: "PATCH",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
