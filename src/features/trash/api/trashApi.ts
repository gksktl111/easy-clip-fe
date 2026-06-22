import {
  TrashClipListResponseDto,
  TrashClipResponseDto,
  TrashDeleteResponseDto,
  TrashFolderListResponseDto,
  TrashFolderResponseDto,
} from "@/features/trash/model/trash.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchTrashClips = async () =>
  apiRequest<TrashClipListResponseDto>("/trash/clips", {
    cache: "no-store",
  });

export const restoreTrashClip = async (clipId: string) =>
  apiRequest<TrashClipResponseDto>(`/trash/clips/${clipId}/restore`, {
    method: "PATCH",
  });

export const deleteTrashClip = async (clipId: string) =>
  apiRequest<TrashDeleteResponseDto>(`/trash/clips/${clipId}`, {
    method: "DELETE",
  });

export const fetchTrashFolders = async () =>
  apiRequest<TrashFolderListResponseDto>("/trash/folders", {
    cache: "no-store",
  });

export const restoreTrashFolder = async (folderId: string) =>
  apiRequest<TrashFolderResponseDto>(`/trash/folders/${folderId}/restore`, {
    method: "PATCH",
  });

export const deleteTrashFolder = async (folderId: string) =>
  apiRequest<TrashDeleteResponseDto>(`/trash/folders/${folderId}`, {
    method: "DELETE",
  });
