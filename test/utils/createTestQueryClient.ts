import { QueryClient } from "@tanstack/react-query";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
