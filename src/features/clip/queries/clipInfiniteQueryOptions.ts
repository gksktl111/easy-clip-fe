import { infiniteQueryOptions } from "@tanstack/react-query";
import { fetchClips } from "@/features/clip/api/clipApi";
import type { ClipFilter } from "@/features/clip/model/clip";
import type { FetchClipsQueryDto } from "@/features/clip/model/clip.dto";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";
import { shouldRetryFolderClipsQuery } from "@/features/clip/service/folderClipQueryState";

const mapFilterToApiType = (filter: ClipFilter): FetchClipsQueryDto["type"] => {
  if (filter === "all") {
    return "ALL";
  }

  return filter.toUpperCase() as FetchClipsQueryDto["type"];
};

interface ClipInfiniteQueryOptions {
  enabled: boolean;
  accessScope?: string;
  favorite?: boolean;
  filter: ClipFilter;
  folderId?: string;
  recent?: boolean;
  searchQuery?: string;
}

// query key, 요청 함수, 페이지네이션 규칙을 함께 재사용합니다.
export const clipInfiniteQueryOptions = ({
  enabled,
  accessScope,
  favorite,
  filter,
  folderId,
  recent,
  searchQuery = "",
}: ClipInfiniteQueryOptions) => {
  const type = mapFilterToApiType(filter);
  const q = searchQuery.trim();

  return infiniteQueryOptions({
    queryKey: clipQueryKeys.list({
      accessScope,
      folderId,
      favorite,
      recent,
      type,
      q,
    }),
    enabled,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      fetchClips(
        { folderId, favorite, recent, type, q, cursor: pageParam },
        signal,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    retry: shouldRetryFolderClipsQuery,
  });
};
