"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FolderClipsPage } from "@/features/clip";
import { invalidateTrashQueries } from "@/features/trash";

// 클립 삭제 결과를 휴지통 캐시 갱신과 연결합니다.
export function FolderClipsRoute() {
  const queryClient = useQueryClient();

  return (
    <FolderClipsPage
      onClipsDeleted={() => invalidateTrashQueries(queryClient)}
    />
  );
}
