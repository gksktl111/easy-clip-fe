"use client";

import { useCallback } from "react";
import { useFoldersQuery } from "@/features/folder/hooks/useFoldersQuery";
import { useTrashActions } from "@/features/trash/hooks/useTrashActions";
import { useTrashItemsQuery } from "@/features/trash/hooks/useTrashItemsQuery";

// 휴지통 조회, 관련 폴더와 복원·삭제 액션을 페이지 영역별 계약으로 조합합니다.
export const useTrashPage = () => {
  const { folders } = useFoldersQuery();
  const query = useTrashItemsQuery();
  const trashActions = useTrashActions();
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
      activeFolders: folders,
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
