import type {
  CreateFolderTagRequestDto,
  FolderTagResponseDto,
  ReplaceClipTagsRequestDto,
  ReplaceClipTagsResponseDto,
  UpdateFolderTagRequestDto,
} from "@/features/clip/model/tag.dto";
import { apiRequest } from "@/shared/lib/apiClient";

const jsonRequest = (method: "POST" | "PATCH" | "PUT", payload: unknown) => ({
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

export const fetchFolderTags = (folderId: string) =>
  apiRequest<FolderTagResponseDto[]>(
    `/folders/${encodeURIComponent(folderId)}/tags`,
    { cache: "no-store" },
  );

export const createFolderTag = (
  folderId: string,
  payload: CreateFolderTagRequestDto,
) =>
  apiRequest<FolderTagResponseDto>(
    `/folders/${encodeURIComponent(folderId)}/tags`,
    jsonRequest("POST", payload),
  );

export const updateFolderTag = (
  folderId: string,
  tagId: string,
  payload: UpdateFolderTagRequestDto,
) =>
  apiRequest<FolderTagResponseDto>(
    `/folders/${encodeURIComponent(folderId)}/tags/${encodeURIComponent(tagId)}`,
    jsonRequest("PATCH", payload),
  );

export const deleteFolderTag = (folderId: string, tagId: string) =>
  apiRequest<null>(
    `/folders/${encodeURIComponent(folderId)}/tags/${encodeURIComponent(tagId)}`,
    { method: "DELETE" },
  );

export const replaceClipTags = (
  clipId: string,
  payload: ReplaceClipTagsRequestDto,
) =>
  apiRequest<ReplaceClipTagsResponseDto>(
    `/clips/${encodeURIComponent(clipId)}/tags`,
    jsonRequest("PUT", payload),
  );
