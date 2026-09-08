"use client";

import { useQuery } from "@tanstack/react-query";
import { folderQueryOptions } from "@/features/folder/queries/folderQueryOptions";
import { useAuth } from "@/features/auth";
import { useResourceAccess } from "@/shared/access/ResourceAccessContext";

// 서버 권한 확인은 앱 조합 계층에서 수행하며 같은 계정의 폴더 query를 구독합니다.
export const useFoldersQuery = () => {
  const { user } = useAuth();
  const access = useResourceAccess();
  const query = useQuery({
    ...folderQueryOptions(user?.id ?? null),
    enabled: false,
  });
  return {
    folders: user ? (query.data ?? []) : [],
    isError: Boolean(user) && access.status === "error",
    isLoading: Boolean(user) && access.status === "checking" && !query.data,
    isRetrying: access.status === "checking",
    refetch: access.refresh,
  };
};
