"use client";

import { QueryClient } from "@tanstack/react-query";

export const TRASH_QUERY_KEYS = {
  all: ["trash"] as const,
  items: (userId: string | null) =>
    [...TRASH_QUERY_KEYS.all, "items", userId] as const,
};

export const invalidateTrashQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: TRASH_QUERY_KEYS.all });
