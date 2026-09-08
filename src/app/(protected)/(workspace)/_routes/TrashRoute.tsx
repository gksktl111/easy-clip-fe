"use client";

import { useQueryClient } from "@tanstack/react-query";
import { clipQueryKeys } from "@/features/clip";
import { invalidateFolderQueries, useFoldersQuery } from "@/features/folder";
import { TrashPage } from "@/features/trash";

// 휴지통 변경 결과를 워크스페이스의 폴더·클립 캐시 갱신과 연결합니다.
export function TrashRoute() {
  const queryClient = useQueryClient();
  const { folders } = useFoldersQuery();

  return (
    <TrashPage
      activeFolders={folders}
      onItemsChanged={async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
          invalidateFolderQueries(queryClient),
        ]);
      }}
    />
  );
}
