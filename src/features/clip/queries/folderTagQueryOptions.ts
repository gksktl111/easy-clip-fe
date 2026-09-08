import { queryOptions } from "@tanstack/react-query";
import { fetchFolderTags } from "@/features/clip/api/tagApi";
import { folderTagQueryKeys } from "@/features/clip/service/tagQueryCache";
import { mapFolderTagResponse } from "@/features/clip/service/mapTagResponse";
import { ApiError } from "@/shared/lib/apiClient";

interface FolderTagQueryOptions {
  enabled: boolean;
  folderId: string;
}

export const folderTagQueryOptions = ({
  enabled,
  folderId,
}: FolderTagQueryOptions) =>
  queryOptions({
    queryKey: folderTagQueryKeys.list(folderId),
    enabled: enabled && Boolean(folderId),
    queryFn: async () =>
      (await fetchFolderTags(folderId)).map(mapFolderTagResponse),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 3,
  });
