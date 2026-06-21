"use client";

import {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { CLIP_QUERY_KEY } from "@/features/clip/hooks/useInfiniteClips";
import { ClipCursorPageResponseDto } from "@/features/clip/model/clip.dto";

type ClipQueryOptions = {
  favorite?: boolean;
};

const getClipQueryOptions = (queryKey: QueryKey) =>
  queryKey[1] as ClipQueryOptions | undefined;

const updateClipFavoriteData = (
  data: InfiniteData<ClipCursorPageResponseDto> | undefined,
  queryKey: QueryKey,
  clipId: string,
  isFavorite: boolean,
) => {
  if (!data) {
    return data;
  }

  const queryOptions = getClipQueryOptions(queryKey);
  const shouldRemoveFromFavorites =
    queryOptions?.favorite === true && !isFavorite;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: shouldRemoveFromFavorites
        ? page.items.filter((clip) => clip.id !== clipId)
        : page.items.map((clip) =>
            clip.id === clipId ? { ...clip, likeByMe: isFavorite } : clip,
          ),
    })),
  };
};

export const invalidateClipQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: [CLIP_QUERY_KEY] });

export const updateClipFavoriteCache = (
  queryClient: QueryClient,
  clipId: string,
  isFavorite: boolean,
) => {
  const clipQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: [CLIP_QUERY_KEY] });
  const snapshots = clipQueries.map((query) => ({
    queryKey: query.queryKey,
    data: query.state.data,
  }));

  for (const query of clipQueries) {
    queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
      query.queryKey,
      (data) =>
        updateClipFavoriteData(data, query.queryKey, clipId, isFavorite),
    );
  }

  return () => {
    for (const snapshot of snapshots) {
      queryClient.setQueryData(snapshot.queryKey, snapshot.data);
    }
  };
};
