"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFolderTag,
  deleteFolderTag,
  updateFolderTag,
} from "@/features/clip/api/tagApi";
import type { TagBackgroundColor } from "@/features/clip/model/tag";
import { clipQueryKeys } from "@/features/clip/queries/clipQueryKey";
import { mapFolderTagResponse } from "@/features/clip/service/mapTagResponse";
import {
  addFolderTagToCache,
  folderTagQueryKeys,
  removeFolderTagFromCache,
  updateFolderTagInCache,
} from "@/features/clip/service/tagQueryCache";
import { ApiError } from "@/shared/lib/apiClient";

interface UseFolderTagMutationsOptions {
  folderId: string;
  isAuthenticated: boolean;
}

interface UpdateTagVariables {
  tagId: string;
  name?: string;
  backgroundColor?: TagBackgroundColor;
}

export const useFolderTagMutations = ({
  folderId,
  isAuthenticated,
}: UseFolderTagMutationsOptions) => {
  const queryClient = useQueryClient();

  const refreshMissingResources = useCallback(
    (error: unknown) => {
      if (!(error instanceof ApiError) || error.status !== 404) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: folderTagQueryKeys.list(folderId),
      });
      void queryClient.invalidateQueries({ queryKey: clipQueryKeys.all });
    },
    [folderId, queryClient],
  );

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      backgroundColor,
    }: {
      name: string;
      backgroundColor?: TagBackgroundColor;
    }) =>
      mapFolderTagResponse(
        await createFolderTag(folderId, { name, backgroundColor }),
      ),
    onSuccess: (tag) => addFolderTagToCache(queryClient, tag),
    onError: refreshMissingResources,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ tagId, name, backgroundColor }: UpdateTagVariables) =>
      mapFolderTagResponse(
        await updateFolderTag(folderId, tagId, { name, backgroundColor }),
      ),
    onSuccess: (tag) => updateFolderTagInCache(queryClient, tag),
    onError: refreshMissingResources,
    onSettled: () =>
      queryClient
        .invalidateQueries({ queryKey: clipQueryKeys.all })
        .catch(() => undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: async (tagId: string) => {
      await deleteFolderTag(folderId, tagId);
      return tagId;
    },
    onSuccess: (tagId) =>
      removeFolderTagFromCache(queryClient, folderId, tagId),
    onError: refreshMissingResources,
    onSettled: () =>
      queryClient
        .invalidateQueries({ queryKey: clipQueryKeys.all })
        .catch(() => undefined),
  });
  const { mutateAsync: createTagAsync } = createMutation;
  const { mutateAsync: updateTagAsync } = updateMutation;
  const { mutateAsync: deleteTagAsync } = deleteMutation;

  const ensureAuthenticated = useCallback(() => {
    if (!isAuthenticated) {
      throw new Error("태그 작업에는 인증이 필요합니다.");
    }
  }, [isAuthenticated]);

  const createTag = useCallback(
    (name: string, backgroundColor?: TagBackgroundColor) => {
      ensureAuthenticated();
      return createTagAsync({ name, backgroundColor });
    },
    [createTagAsync, ensureAuthenticated],
  );

  const updateTag = useCallback(
    (
      tagId: string,
      payload: { name?: string; backgroundColor?: TagBackgroundColor },
    ) => {
      ensureAuthenticated();
      return updateTagAsync({ tagId, ...payload });
    },
    [ensureAuthenticated, updateTagAsync],
  );

  const removeTag = useCallback(
    (tagId: string) => {
      ensureAuthenticated();
      return deleteTagAsync(tagId);
    },
    [deleteTagAsync, ensureAuthenticated],
  );

  return {
    createTag,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    removeTag,
    updateTag,
  };
};
