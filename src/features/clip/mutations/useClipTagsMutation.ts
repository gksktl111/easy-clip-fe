"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replaceClipTags } from "@/features/clip/api/tagApi";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";
import {
  folderTagQueryKeys,
  updateClipTagsInCache,
} from "@/features/clip/service/tagQueryCache";
import { ApiError } from "@/shared/lib/apiClient";

interface UseClipTagsMutationOptions {
  folderId: string;
  isAuthenticated: boolean;
}

interface ReplaceTagsVariables {
  clipId: string;
  tagNames: string[];
}

export const useClipTagsMutation = ({
  folderId,
  isAuthenticated,
}: UseClipTagsMutationOptions) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ clipId, tagNames }: ReplaceTagsVariables) =>
      replaceClipTags(clipId, { tags: tagNames }),
    onSuccess: (response, variables) => {
      updateClipTagsInCache(queryClient, variables.clipId, response.tags);
      void queryClient.invalidateQueries({
        queryKey: folderTagQueryKeys.list(folderId),
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: clipQueryKeys.all });
      }
    },
  });
  const { mutateAsync } = mutation;

  const saveClipTags = useCallback(
    (clipId: string, tagNames: string[]) => {
      if (!isAuthenticated) {
        throw new Error("클립 태그 저장에는 인증이 필요합니다.");
      }

      return mutateAsync({ clipId, tagNames });
    },
    [isAuthenticated, mutateAsync],
  );

  return {
    isPending: mutation.isPending,
    saveClipTags,
  };
};
