"use client";

import { useQueryClient } from "@tanstack/react-query";
import { invalidateClipQueries } from "@/features/clip";
import { invalidateFolderQueries, useFoldersQuery } from "@/features/folder";
import { TrashPage } from "@/features/trash";

// 휴지통 변경 결과를 폴더와 클립 캐시 갱신에 연결합니다.
export function TrashRoute() {
  const queryClient = useQueryClient();
  const { folders } = useFoldersQuery();

  return (
    <TrashPage
      activeFolders={folders}
      onItemsChanged={async () => {
        await Promise.all([
          invalidateClipQueries(queryClient),
          invalidateFolderQueries(queryClient),
        ]);
      }}
    />
  );
}
