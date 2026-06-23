"use client";

import { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";
import { CLIP_QUERY_KEY } from "@/features/clip/hooks/useInfiniteClips";
import {
  ClipCursorPageResponseDto,
  ClipListItemResponseDto,
  ClipResponseDto,
} from "@/features/clip/model/clip.dto";

type ClipQueryOptions = {
  folderId?: string | null;
  favorite?: boolean;
  q?: string;
  recent?: boolean;
  type?: "TEXT" | "COLOR" | "IMAGE" | "ALL";
};

type ClipQuerySnapshot = {
  data: unknown;
  queryKey: QueryKey;
};

type RemovedClipPageSnapshot = {
  items: Array<{
    clip: ClipListItemResponseDto;
    index: number;
  }>;
  pageIndex: number;
};

type RemovedClipQuerySnapshot = {
  pages: RemovedClipPageSnapshot[];
  queryKey: QueryKey;
};

const getClipQueryOptions = (queryKey: QueryKey) =>
  queryKey[1] as ClipQueryOptions | undefined;

const getClipQueries = (queryClient: QueryClient) =>
  queryClient.getQueryCache().findAll({ queryKey: [CLIP_QUERY_KEY] });

const getClipQuerySnapshots = (queryClient: QueryClient) =>
  getClipQueries(queryClient).map<ClipQuerySnapshot>((query) => ({
    queryKey: query.queryKey,
    data: query.state.data,
  }));

const restoreClipQuerySnapshots = (
  queryClient: QueryClient,
  snapshots: ClipQuerySnapshot[],
) => {
  for (const snapshot of snapshots) {
    queryClient.setQueryData(snapshot.queryKey, snapshot.data);
  }
};

const removeClipIdsFromData = (
  data: InfiniteData<ClipCursorPageResponseDto> | undefined,
  clipIds: Set<string>,
) => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((clip) => !clipIds.has(clip.id)),
    })),
  };
};

const restoreRemovedClips = (
  data: InfiniteData<ClipCursorPageResponseDto> | undefined,
  snapshot: RemovedClipQuerySnapshot,
) => {
  if (!data) {
    return data;
  }

  const existingClipIds = new Set(
    data.pages.flatMap((page) => page.items.map((clip) => clip.id)),
  );

  return {
    ...data,
    pages: data.pages.map((page, pageIndex) => {
      const pageSnapshot = snapshot.pages.find(
        (removedPage) => removedPage.pageIndex === pageIndex,
      );

      if (!pageSnapshot) {
        return page;
      }

      const nextItems = [...page.items];

      for (const { clip, index } of pageSnapshot.items) {
        if (existingClipIds.has(clip.id)) {
          continue;
        }

        nextItems.splice(Math.min(index, nextItems.length), 0, clip);
        existingClipIds.add(clip.id);
      }

      return {
        ...page,
        items: nextItems,
      };
    }),
  };
};

const matchesSearchQuery = (
  clip: ClipListItemResponseDto,
  searchQuery?: string,
) => {
  const normalizedQuery = searchQuery?.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [clip.title, clip.textContent, clip.colorHex]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
};

const matchesClipQueryOptions = (
  clip: ClipListItemResponseDto,
  queryOptions: ClipQueryOptions | undefined,
) => {
  if (!queryOptions) {
    return true;
  }

  if (queryOptions.favorite && !clip.likeByMe) {
    return false;
  }

  if (queryOptions.folderId && queryOptions.folderId !== clip.folderId) {
    return false;
  }

  if (
    queryOptions.type &&
    queryOptions.type !== "ALL" &&
    queryOptions.type !== clip.type
  ) {
    return false;
  }

  return matchesSearchQuery(clip, queryOptions.q);
};

const updateClipFavoriteData = (
  data: InfiniteData<ClipCursorPageResponseDto> | undefined,
  queryKey: QueryKey,
  clipId: string,
  isFavorite: boolean,
  favoriteClip: ClipListItemResponseDto | null,
) => {
  if (!data) {
    return data;
  }

  const queryOptions = getClipQueryOptions(queryKey);
  const shouldRemoveFromFavorites =
    queryOptions?.favorite === true && !isFavorite;
  const nextFavoriteClip = favoriteClip
    ? { ...favoriteClip, likeByMe: isFavorite }
    : null;
  const shouldInsertIntoFavorites =
    queryOptions?.favorite === true &&
    isFavorite &&
    nextFavoriteClip &&
    matchesClipQueryOptions(nextFavoriteClip, queryOptions) &&
    !data.pages.some((page) => page.items.some((clip) => clip.id === clipId));

  if (shouldInsertIntoFavorites && nextFavoriteClip) {
    return moveClipToFirstPage(data, nextFavoriteClip);
  }

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

const moveClipToFirstPage = (
  data: InfiniteData<ClipCursorPageResponseDto> | undefined,
  clip: ClipListItemResponseDto,
) => {
  if (!data) {
    return data;
  }

  const [firstPage] = data.pages;

  if (!firstPage) {
    return data;
  }

  const pagesWithoutClip = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((item) => item.id !== clip.id),
  }));
  const [nextFirstPage, ...nextRestPages] = pagesWithoutClip;

  return {
    ...data,
    pages: [
      {
        ...nextFirstPage,
        items: [clip, ...nextFirstPage.items],
      },
      ...nextRestPages,
    ],
  };
};

export const invalidateClipQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: [CLIP_QUERY_KEY] });

export const cancelClipQueries = (queryClient: QueryClient) =>
  queryClient.cancelQueries({ queryKey: [CLIP_QUERY_KEY] });

export const updateClipFavoriteCache = (
  queryClient: QueryClient,
  clipId: string,
  isFavorite: boolean,
) => {
  const clipQueries = getClipQueries(queryClient);
  const snapshots = getClipQuerySnapshots(queryClient);
  const favoriteClip =
    clipQueries
      .flatMap((query) => {
        const data = query.state.data as
          | InfiniteData<ClipCursorPageResponseDto>
          | undefined;

        return data?.pages.flatMap((page) => page.items) ?? [];
      })
      .find((clip) => clip.id === clipId) ?? null;

  for (const query of clipQueries) {
    queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
      query.queryKey,
      (data) =>
        updateClipFavoriteData(
          data,
          query.queryKey,
          clipId,
          isFavorite,
          favoriteClip,
        ),
    );
  }

  return () => restoreClipQuerySnapshots(queryClient, snapshots);
};

export const removeClipsFromCache = (
  queryClient: QueryClient,
  clipIds: string[],
) => {
  const clipIdSet = new Set(clipIds);
  const clipQueries = getClipQueries(queryClient);
  const removedSnapshots: RemovedClipQuerySnapshot[] = [];

  for (const query of clipQueries) {
    const data = query.state.data as
      | InfiniteData<ClipCursorPageResponseDto>
      | undefined;
    const removedPages =
      data?.pages.flatMap<RemovedClipPageSnapshot>((page, pageIndex) => {
        const removedItems = page.items
          .map((clip, index) => ({ clip, index }))
          .filter(({ clip }) => clipIdSet.has(clip.id));

        return removedItems.length > 0
          ? [{ pageIndex, items: removedItems }]
          : [];
      }) ?? [];

    if (removedPages.length > 0) {
      removedSnapshots.push({
        queryKey: query.queryKey,
        pages: removedPages,
      });
    }

    queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
      query.queryKey,
      (data) => removeClipIdsFromData(data, clipIdSet),
    );
  }

  return () => {
    for (const snapshot of removedSnapshots) {
      queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
        snapshot.queryKey,
        (data) => restoreRemovedClips(data, snapshot),
      );
    }
  };
};

export const addOptimisticClipToCache = (
  queryClient: QueryClient,
  optimisticClip: ClipListItemResponseDto,
) => {
  const clipQueries = getClipQueries(queryClient);

  for (const query of clipQueries) {
    queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
      query.queryKey,
      (data) => {
        if (
          !data ||
          !matchesClipQueryOptions(
            optimisticClip,
            getClipQueryOptions(query.queryKey),
          )
        ) {
          return data;
        }

        const [firstPage, ...restPages] = data.pages;

        if (!firstPage) {
          return data;
        }

        return {
          ...data,
          pages: [
            {
              ...firstPage,
              items: [
                optimisticClip,
                ...firstPage.items.filter(
                  (clip) => clip.id !== optimisticClip.id,
                ),
              ],
            },
            ...restPages,
          ],
        };
      },
    );
  }

  return () => {
    const optimisticClipIds = new Set([optimisticClip.id]);

    for (const query of getClipQueries(queryClient)) {
      queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
        query.queryKey,
        (data) => removeClipIdsFromData(data, optimisticClipIds),
      );
    }
  };
};

export const mapClipResponseToListItem = (
  clip: ClipResponseDto,
): ClipListItemResponseDto => ({
  id: clip.id,
  type: clip.type,
  title: clip.title,
  textContent: clip.textContent,
  colorHex: clip.colorHex,
  imageUrl: clip.imageUrl,
  workspaceId: clip.workspaceId,
  folderId: clip.folderId,
  createdAt: clip.createdAt,
  updatedAt: clip.updatedAt,
  deletedAt: clip.deletedAt,
  likeByMe: false,
  tags: [],
});

export const replaceOptimisticClipInCache = (
  queryClient: QueryClient,
  optimisticClipId: string,
  nextClip: ClipListItemResponseDto,
) => {
  const clipQueries = getClipQueries(queryClient);

  for (const query of clipQueries) {
    queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
      query.queryKey,
      (data) => {
        if (!data) {
          return data;
        }

        const queryOptions = getClipQueryOptions(query.queryKey);

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.flatMap((clip) => {
              if (clip.id !== optimisticClipId) {
                return clip.id === nextClip.id ? [] : [clip];
              }

              return matchesClipQueryOptions(nextClip, queryOptions)
                ? [nextClip]
                : [];
            }),
          })),
        };
      },
    );
  }
};

export const moveClipToRecentCache = (
  queryClient: QueryClient,
  clipId: string,
) => {
  const clipQueries = getClipQueries(queryClient);
  const copiedClip = clipQueries
    .flatMap((query) => {
      const data = query.state.data as
        | InfiniteData<ClipCursorPageResponseDto>
        | undefined;

      return data?.pages.flatMap((page) => page.items) ?? [];
    })
    .find((clip) => clip.id === clipId);

  if (!copiedClip) {
    return;
  }

  for (const query of clipQueries) {
    const queryOptions = getClipQueryOptions(query.queryKey);

    if (
      !queryOptions?.recent ||
      !matchesClipQueryOptions(copiedClip, queryOptions)
    ) {
      continue;
    }

    queryClient.setQueryData<InfiniteData<ClipCursorPageResponseDto>>(
      query.queryKey,
      (data) => moveClipToFirstPage(data, copiedClip),
    );
  }
};
