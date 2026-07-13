"use client";

import { useCallback } from "react";
import { useTrashActions } from "@/features/trash/hooks/useTrashActions";
import { useTrashItemsQuery } from "@/features/trash/hooks/useTrashItemsQuery";

interface UseTrashPageOptions {
  activeFolders: Array<{ id: string; name: string }>;
  onItemsChanged?: () => void | Promise<void>;
}

// 휴지통 조회, 관련 폴더와 복원·삭제 액션을 페이지 영역별 계약으로 조합합니다.
export const useTrashPage = ({
  activeFolders,
  onItemsChanged,
}: UseTrashPageOptions) => {
  const query = useTrashItemsQuery();
  const trashActions = useTrashActions({ onItemsChanged });
  const { refetch } = query;
  const { clearError, error: actionError, ...actions } = trashActions;

  const reload = useCallback(async () => {
    clearError();
    await refetch();
  }, [clearError, refetch]);

  return {
    actions: {
      ...actions,
      reload,
    },
    context: {
      activeFolders,
    },
    results: {
      error: actionError ?? (query.isError ? "load" : null),
      fetchNextPage: query.fetchNextPage,
      hasNextPage: query.hasNextPage,
      isFetchingNextPage: query.isFetchingNextPage,
      isLoading: query.isLoading,
      items: query.items,
    },
  };
};
