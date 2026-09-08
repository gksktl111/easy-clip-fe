import { queryOptions } from "@tanstack/react-query";
import { fetchFolders } from "@/features/folder/api/folderApi";
import {
  mapFolder,
  sortFolders,
} from "@/features/folder/service/folderCollection";
import { getFolderQueryKey } from "@/features/folder/service/folderQueryCache";

export const folderQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: getFolderQueryKey(userId),
    queryFn: async ({ signal }) =>
      sortFolders((await fetchFolders(signal)).map(mapFolder)),
  });
