import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ClipCursorPageResponseDto } from "@/features/clip/model/clip.dto";
import type { FolderTag } from "@/features/clip/model/tag";
import type { ClipTagResponseDto } from "@/features/clip/model/tag.dto";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";

export const folderTagQueryKeys = {
  all: ["folder-tags"] as const,
  list: (folderId: string) => ["folder-tags", folderId] as const,
};

export const addFolderTagToCache = (
  queryClient: QueryClient,
  tag: FolderTag,
) => {
  queryClient.setQueryData<FolderTag[]>(
    folderTagQueryKeys.list(tag.folderId),
    (currentTags = []) =>
      currentTags.some((currentTag) => currentTag.id === tag.id)
        ? currentTags.map((currentTag) =>
            currentTag.id === tag.id ? tag : currentTag,
          )
        : [...currentTags, tag],
  );
};

export const updateFolderTagInCache = (
  queryClient: QueryClient,
  tag: FolderTag,
) => {
  queryClient.setQueryData<FolderTag[]>(
    folderTagQueryKeys.list(tag.folderId),
    (currentTags = []) =>
      currentTags.map((currentTag) =>
        currentTag.id === tag.id ? tag : currentTag,
      ),
  );
};

export const removeFolderTagFromCache = (
  queryClient: QueryClient,
  folderId: string,
  tagId: string,
) => {
  queryClient.setQueryData<FolderTag[]>(
    folderTagQueryKeys.list(folderId),
    (currentTags = []) =>
      currentTags.filter((currentTag) => currentTag.id !== tagId),
  );
};

export const updateClipTagsInCache = (
  queryClient: QueryClient,
  clipId: string,
  tags: ClipTagResponseDto[],
) => {
  queryClient.setQueriesData<InfiniteData<ClipCursorPageResponseDto>>(
    { queryKey: clipQueryKeys.all },
    (currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        pages: currentData.pages.map((page) => ({
          ...page,
          items: page.items.map((clip) =>
            clip.id === clipId ? { ...clip, tags } : clip,
          ),
        })),
      };
    },
  );
};
