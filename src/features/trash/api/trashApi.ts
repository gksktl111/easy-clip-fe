import {
  TrashClipListResponseDto,
  TrashClipResponseDto,
  TrashDeleteResponseDto,
  TrashFolderListResponseDto,
  TrashFolderResponseDto,
} from "@/features/trash/model/trash.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchTrashClips = async (accessToken: string) =>
  apiRequest<TrashClipListResponseDto>("/trash/clips", {
    accessToken,
    cache: "no-store",
  });

export const restoreTrashClip = async (accessToken: string, clipId: string) =>
  apiRequest<TrashClipResponseDto>(`/trash/clips/${clipId}/restore`, {
    method: "PATCH",
    accessToken,
  });

export const deleteTrashClip = async (accessToken: string, clipId: string) =>
  apiRequest<TrashDeleteResponseDto>(`/trash/clips/${clipId}`, {
    method: "DELETE",
    accessToken,
  });

export const fetchTrashFolders = async (accessToken: string) =>
  apiRequest<TrashFolderListResponseDto>("/trash/folders", {
    accessToken,
    cache: "no-store",
  });

export const restoreTrashFolder = async (
  accessToken: string,
  folderId: string,
) =>
  apiRequest<TrashFolderResponseDto>(`/trash/folders/${folderId}/restore`, {
    method: "PATCH",
    accessToken,
  });

export const deleteTrashFolder = async (
  accessToken: string,
  folderId: string,
) =>
  apiRequest<TrashDeleteResponseDto>(`/trash/folders/${folderId}`, {
    method: "DELETE",
    accessToken,
  });
