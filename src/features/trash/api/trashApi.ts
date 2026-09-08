import {
  TrashDeleteAllResponseDto,
  TrashItemMutationDto,
  TrashListResponseDto,
  TrashRestoreResponseDto,
} from "@/features/trash/model/trash.dto";
import { apiRequest } from "@/shared/lib/apiClient";

interface FetchTrashItemsOptions {
  cursor?: string | null;
  limit?: number;
}

export const fetchTrashItems = async ({
  cursor,
  limit = 20,
}: FetchTrashItemsOptions = {}, signal?: AbortSignal) => {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(limit));

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return apiRequest<TrashListResponseDto>(`/trash?${searchParams}`, {
    cache: "no-store",
    signal,
  });
};

const uniqueItems = (items: TrashItemMutationDto[]) => [...new Map(items.map((item) => [`${item.itemType}:${item.id}`, item])).values()];

const trashJsonHeaders = {
  "Content-Type": "application/json",
};

export const restoreTrashItems = async (items: TrashItemMutationDto[]) =>
  apiRequest<TrashRestoreResponseDto>("/trash/restore", {
    method: "PATCH",
    headers: trashJsonHeaders,
    body: JSON.stringify({ items: uniqueItems(items) }),
  });

export const deleteTrashItems = async (items: TrashItemMutationDto[]) =>
  apiRequest<TrashDeleteAllResponseDto>("/trash/items", {
    method: "DELETE",
    headers: trashJsonHeaders,
    body: JSON.stringify({ items: uniqueItems(items) }),
  });

export const restoreTrashClip = async (clipId: string) =>
  restoreTrashItems([{ itemType: "CLIP", id: clipId }]);

export const deleteTrashClip = async (clipId: string) =>
  deleteTrashItems([{ itemType: "CLIP", id: clipId }]);

export const restoreTrashFolder = async (folderId: string) =>
  restoreTrashItems([{ itemType: "FOLDER", id: folderId }]);

export const deleteTrashFolder = async (folderId: string) =>
  deleteTrashItems([{ itemType: "FOLDER", id: folderId }]);

export const deleteAllTrashItems = async () =>
  apiRequest<TrashDeleteAllResponseDto>("/trash", {
    method: "DELETE",
  });
