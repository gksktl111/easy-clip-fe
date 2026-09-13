"use client";

import { canUseClipOrganization } from "@/features/clip/service/clipOrganizationAccess";
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
  const canRead = canUseClipOrganization(access, folderId);
  const query = useQuery(
    folderTagQueryOptions({ enabled: enabled && canRead, folderId }),
  );

  return {
    error: query.error,
    isError: query.isError,
    isLoading: enabled && canRead && query.isPending,
    refetch: () => (enabled && canRead ? query.refetch() : Promise.resolve()),
    tags: canRead ? (query.data ?? []) : [],
  };
};
