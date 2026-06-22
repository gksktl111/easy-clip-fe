import {
  ClipCursorPageResponseDto,
  ClipResponseDto,
  CreateImageClipRequestDto,
  CreateTextClipRequestDto,
  FetchClipsQueryDto,
  LikeClipResponseDto,
} from "@/features/clip/model/clip.dto";
import { apiRequest } from "@/shared/lib/apiClient";

export const fetchClips = async (
  options: FetchClipsQueryDto = {},
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

  if (options.cursor) {
    searchParams.set("cursor", options.cursor);
  }

  return apiRequest<ClipCursorPageResponseDto>(`/clips?${searchParams}`, {
    cache: "no-store",
  });
};

export const createTextClip = (payload: CreateTextClipRequestDto) => {
  const formData = new FormData();
  formData.set("folderId", payload.folderId);
  formData.set("text", payload.text);

  return apiRequest<ClipResponseDto>("/clips", {
    method: "POST",
    body: formData,
  });
};

export const createImageClip = (payload: CreateImageClipRequestDto) => {
  const formData = new FormData();
  formData.set("folderId", payload.folderId);
  formData.set("file", payload.file);

  return apiRequest<ClipResponseDto>("/clips", {
    method: "POST",
    body: formData,
  });
};

export const removeClip = (clipId: string) =>
  apiRequest<ClipResponseDto>(`/clips/${clipId}`, {
    method: "DELETE",
  });

export const likeClip = (clipId: string) =>
  apiRequest<LikeClipResponseDto>(`/clips/${clipId}/likes`, {
    method: "POST",
  });

export const unlikeClip = (clipId: string) =>
  apiRequest<LikeClipResponseDto>(`/clips/${clipId}/likes`, {
    method: "DELETE",
  });

export const recordClipView = (clipId: string) =>
  apiRequest<null>(`/clips/${clipId}/views`, {
    method: "POST",
  });
