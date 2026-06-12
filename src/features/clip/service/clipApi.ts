import { apiRequest } from "@/shared/lib/apiClient";

export type ApiClipType = "TEXT" | "COLOR" | "IMAGE";

export interface ClipListItemResponseDto {
  id: string;
  type: ApiClipType;
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
  tags: { id: string; name: string }[];
}

interface ClipCursorPageResponseDto {
  items: ClipListItemResponseDto[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const fetchClips = async (
  accessToken: string,
  options: {
    folderId?: string;
    favorite?: boolean;
    recent?: boolean;
    type?: "TEXT" | "COLOR" | "IMAGE" | "ALL";
    q?: string;
  } = {},
) => {
  const searchParams = new URLSearchParams();
  searchParams.set("type", options.type ?? "ALL");

  if (options.folderId) {
    searchParams.set("folderId", options.folderId);
  }

  if (options.favorite) {
    searchParams.set("favorite", "true");
  }

  if (options.recent) {
    searchParams.set("recent", "true");
  }

  if (options.q?.trim()) {
    searchParams.set("q", options.q.trim());
  }

  const response = await apiRequest<ClipCursorPageResponseDto>(
    `/clips?${searchParams.toString()}`,
    {
      accessToken,
      cache: "no-store",
    },
  );

  return response.items;
};

export const createTextClip = (
  accessToken: string,
  payload: { folderId: string; text: string },
) => {
  const formData = new FormData();
  formData.set("folderId", payload.folderId);
  formData.set("text", payload.text);

  return apiRequest("/clips", {
    method: "POST",
    accessToken,
    body: formData,
  });
};

export const createImageClip = (
  accessToken: string,
  payload: { folderId: string; file: File },
) => {
  const formData = new FormData();
  formData.set("folderId", payload.folderId);
  formData.set("file", payload.file);

  return apiRequest("/clips", {
    method: "POST",
    accessToken,
    body: formData,
  });
};

export const removeClip = (accessToken: string, clipId: string) =>
  apiRequest(`/clips/${clipId}`, {
    method: "DELETE",
    accessToken,
  });

export const likeClip = (accessToken: string, clipId: string) =>
  apiRequest<{ likeByMe: boolean }>(`/clips/${clipId}/likes`, {
    method: "POST",
    accessToken,
  });

export const unlikeClip = (accessToken: string, clipId: string) =>
  apiRequest<{ likeByMe: boolean }>(`/clips/${clipId}/likes`, {
    method: "DELETE",
    accessToken,
  });

export const recordClipView = (accessToken: string, clipId: string) =>
  apiRequest<null>(`/clips/${clipId}/views`, {
    method: "POST",
    accessToken,
  });
