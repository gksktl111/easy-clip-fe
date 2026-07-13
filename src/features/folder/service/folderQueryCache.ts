export const FOLDER_QUERY_KEY = "folders";

export const getFolderQueryKey = (userId: string | null) =>
  [FOLDER_QUERY_KEY, userId] as const;
