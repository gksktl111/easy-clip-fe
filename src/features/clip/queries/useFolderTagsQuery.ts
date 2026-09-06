"use client";

import { useQuery } from "@tanstack/react-query";
import { folderTagQueryOptions } from "@/features/clip/queries/folderTagQueryOptions";

interface UseFolderTagsQueryOptions {
  enabled: boolean;
  folderId: string;
}

export const useFolderTagsQuery = ({
  enabled,
  folderId,
}: UseFolderTagsQueryOptions) => {
  const query = useQuery(folderTagQueryOptions({ enabled, folderId }));

  return {
    error: query.error,
    isError: query.isError,
    isLoading: enabled && query.isPending,
    refetch: query.refetch,
    tags: query.data ?? [],
  };
};
