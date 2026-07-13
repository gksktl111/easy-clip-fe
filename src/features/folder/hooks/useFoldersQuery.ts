"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFolders } from "@/features/folder/api/folderApi";
import {
  mapFolder,
  sortFolders,
} from "@/features/folder/service/folderCollection";
import { getFolderQueryKey } from "@/features/folder/service/folderQueryCache";
import { waitForMinimumLoading } from "@/shared/lib/loading";
import { useSession } from "@/shared/session/useSession";

// 인증 사용자에 해당하는 폴더 목록을 조회하고 정렬된 도메인 모델로 제공합니다.
export const useFoldersQuery = () => {
  const { user } = useSession();
  const isAuthenticated = Boolean(user);
  const folderQuery = useQuery({
    queryKey: getFolderQueryKey(user?.id ?? null),
    enabled: isAuthenticated,
    queryFn: async () => {
      const loadingStartedAt = Date.now();

      try {
        const response = await fetchFolders();
        return sortFolders(response.map(mapFolder));
      } finally {
        await waitForMinimumLoading(loadingStartedAt);
      }
    },
  });

  return {
    folders: isAuthenticated ? (folderQuery.data ?? []) : [],
    isLoading: isAuthenticated && folderQuery.isPending,
  };
};
