import {
  CreateFolderRequestDto,
  FolderResponseDto,
  ReorderFolderRequestDto,
  UpdateFolderRequestDto,
} from "@/features/folder/model/folder.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchFolders = (accessToken: string) =>
  apiRequest<FolderResponseDto[]>("/folders", {
    accessToken,
    cache: "no-store",
  });

export const createFolder = (
  accessToken: string,
  payload: CreateFolderRequestDto,
) =>
  apiRequest<FolderResponseDto>("/folders", {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateFolder = (
  accessToken: string,
  folderId: string,
  payload: UpdateFolderRequestDto,
) =>
  apiRequest<FolderResponseDto>(`/folders/${folderId}`, {
    method: "PATCH",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteFolder = (accessToken: string, folderId: string) =>
  apiRequest<FolderResponseDto>(`/folders/${folderId}`, {
    method: "DELETE",
    accessToken,
  });

export const reorderFolder = (
  accessToken: string,
  payload: ReorderFolderRequestDto,
) =>
  apiRequest<FolderResponseDto>("/folders/reorder", {
    method: "PATCH",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
