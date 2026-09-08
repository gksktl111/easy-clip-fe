"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
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
  const access = useResourceAccess();
  const canRead = access.status === "ready" && access.folderLocks[folderId] === false;
  const query = useQuery(folderTagQueryOptions({ enabled: enabled && canRead, folderId }));

  return {
    error: query.error,
    isError: query.isError,
    isLoading: enabled && query.isPending,
    refetch: query.refetch,
    tags: canRead ? query.data ?? [] : [],
  };
};
