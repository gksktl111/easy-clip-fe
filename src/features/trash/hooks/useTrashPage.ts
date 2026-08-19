"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useTrashActions } from "@/features/trash/hooks/useTrashActions";
import { useTrashItemsQuery } from "@/features/trash/hooks/useTrashItemsQuery";
import type { TrashFolderReference } from "@/features/trash/service/trashRowMapper";
import {
  createTrashFolderNameById,
  mapTrashItemsToRows,
} from "@/features/trash/service/trashRowMapper";

interface UseTrashPageOptions {
  activeFolders: TrashFolderReference[];
  onItemsChanged?: () => void | Promise<void>;
}

// 휴지통 조회, 관련 폴더와 복원·삭제 액션을 페이지 영역별 계약으로 조합합니다.
export const useTrashPage = ({
  activeFolders,
  onItemsChanged,
}: UseTrashPageOptions) => {
  const t = useTranslations("trash");
  const query = useTrashItemsQuery();
  const trashActions = useTrashActions({ onItemsChanged });
  const { refetch } = query;
  const { clearError, error: actionError, ...actions } = trashActions;
  const labels = useMemo(
    () => ({
      folderType: t("folderType"),
      fileType: t("fileType"),
      unknownParentFolder: t("unknownParentFolder"),
      clipTypes: {
        TEXT: t("clipKinds.text"),
        COLOR: t("clipKinds.color"),
        IMAGE: t("clipKinds.image"),
      },
    }),
    [t],
  );
  const folderNameById = useMemo(
    () => createTrashFolderNameById(activeFolders, query.items),
    [activeFolders, query.items],
  );
  const rows = useMemo(
    () =>
      mapTrashItemsToRows(query.items, {
        folderNameById,
        labels,
      }),
    [folderNameById, labels, query.items],
  );

  const reload = useCallback(async () => {
    clearError();
    await refetch();
  }, [clearError, refetch]);

  return {
    actions: {
      ...actions,
      reload,
    },
    results: {
      error: actionError ?? (query.isError ? "load" : null),
      fetchNextPage: query.fetchNextPage,
      hasNextPage: query.hasNextPage,
      isFetchingNextPage: query.isFetchingNextPage,
      isLoading: query.isLoading,
      rows,
    },
  };
};
