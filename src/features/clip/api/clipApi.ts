import {
  ClipCursorPageResponseDto,
  ClipResponseDto,
  CreateImageClipRequestDto,
  CreateTextClipRequestDto,
  FetchClipsQueryDto,
  LikeClipResponseDto,
} from "@/features/clip/model/clip.dto";
import { apiRequest } from "@/shared/lib/apiClient";

//? 이거 뭔지 확인
export const fetchClips = async (
  accessToken: string,
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
  payload: CreateTextClipRequestDto,
) => {
  const formData = new FormData();
  formData.set("folderId", payload.folderId);
  formData.set("text", payload.text);

  return apiRequest<ClipResponseDto>("/clips", {
    method: "POST",
    accessToken,
    body: formData,
  });
};

export const createImageClip = (
  accessToken: string,
  payload: CreateImageClipRequestDto,
) => {
  const formData = new FormData();
  formData.set("folderId", payload.folderId);
  formData.set("file", payload.file);

  return apiRequest<ClipResponseDto>("/clips", {
    method: "POST",
    accessToken,
    body: formData,
  });
};

export const removeClip = (accessToken: string, clipId: string) =>
  apiRequest<ClipResponseDto>(`/clips/${clipId}`, {
    method: "DELETE",
    accessToken,
  });

export const likeClip = (accessToken: string, clipId: string) =>
  apiRequest<LikeClipResponseDto>(`/clips/${clipId}/likes`, {
    method: "POST",
    accessToken,
  });

export const unlikeClip = (accessToken: string, clipId: string) =>
  apiRequest<LikeClipResponseDto>(`/clips/${clipId}/likes`, {
    method: "DELETE",
    accessToken,
  });

export const recordClipView = (accessToken: string, clipId: string) =>
  apiRequest<null>(`/clips/${clipId}/views`, {
    method: "POST",
    accessToken,
  });
