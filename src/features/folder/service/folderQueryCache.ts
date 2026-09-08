import type { QueryClient } from "@tanstack/react-query";

export const FOLDER_QUERY_KEY = "folders";

export const getFolderQueryKey = (userId: string | null) =>
  [FOLDER_QUERY_KEY, userId] as const;

export const invalidateFolderQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: [FOLDER_QUERY_KEY] });
