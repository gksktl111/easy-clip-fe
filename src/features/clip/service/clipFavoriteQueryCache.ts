import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import type { ClipCursorPageResponseDto } from "@/features/clip/model/clip.dto";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

type ClipPages = InfiniteData<ClipCursorPageResponseDto>;
type FavoriteSnapshot = Array<{ queryKey: QueryKey; isFavorite: boolean }>;

const updateFavorite = (
  data: ClipPages | undefined,
  clipId: string,
  isFavorite: boolean,
): ClipPages | undefined =>
  data && {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((clip) =>
        clip.id === clipId ? { ...clip, likeByMe: isFavorite } : clip,
      ),
    })),
  };

// 기존 항목의 즐겨찾기 값만 바꾸고 목록 소속·페이지 경계는 서버 재조회로 확정합니다.
export const optimisticallyUpdateClipFavorite = (
  queryClient: QueryClient,
  clipId: string,
  isFavorite: boolean,
): FavoriteSnapshot => {
  const snapshot: FavoriteSnapshot = [];
  for (const [queryKey, data] of queryClient.getQueriesData<ClipPages>({
    queryKey: clipQueryKeys.all,
  })) {
    const clip = data?.pages
      .flatMap((page) => page.items)
      .find((clip) => clip.id === clipId);
    if (!clip) continue;
    snapshot.push({ queryKey, isFavorite: clip.likeByMe });
    queryClient.setQueryData<ClipPages>(queryKey, (current) =>
      updateFavorite(current, clipId, isFavorite),
    );
  }
  return snapshot;
};

export const restoreClipFavorite = (
  queryClient: QueryClient,
  clipId: string,
  snapshot: FavoriteSnapshot,
) => {
  for (const { queryKey, isFavorite } of snapshot) {
    // 요청 중 바뀐 태그·다른 항목·페이지를 덮어쓰지 않습니다.
    queryClient.setQueryData<ClipPages>(queryKey, (current) =>
      updateFavorite(current, clipId, isFavorite),
    );
  }
};
