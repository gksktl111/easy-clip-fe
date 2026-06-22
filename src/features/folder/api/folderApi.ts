import {
  CreateFolderRequestDto,
  FolderResponseDto,
  ReorderFolderRequestDto,
  UpdateFolderRequestDto,
} from "@/features/folder/model/folder.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchFolders = () =>
  apiRequest<FolderResponseDto[]>("/folders", {
    cache: "no-store",
  });

export const createFolder = (payload: CreateFolderRequestDto) =>
  apiRequest<FolderResponseDto>("/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateFolder = (
  folderId: string,
  payload: UpdateFolderRequestDto,
) =>
  apiRequest<FolderResponseDto>(`/folders/${folderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteFolder = (folderId: string) =>
  apiRequest<FolderResponseDto>(`/folders/${folderId}`, {
    method: "DELETE",
  });

export const reorderFolder = (payload: ReorderFolderRequestDto) =>
  apiRequest<FolderResponseDto>("/folders/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
