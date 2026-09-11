"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useFoldersQuery } from "@/features/folder";
import { FolderClipsPage } from "@/features/clip";
import { invalidateTrashQueries } from "@/features/trash";

// 클립 삭제 결과를 휴지통 캐시 갱신과 연결합니다.
interface FolderClipsRouteProps {
  folderId: string;
}

export function FolderClipsRoute({ folderId }: FolderClipsRouteProps) {
  const { folders } = useFoldersQuery();
  const queryClient = useQueryClient();

  return (
    <FolderClipsPage
      folderId={folderId}
      folderName={folders.find((folder) => folder.id === folderId)?.name}
      onClipsDeleted={() => invalidateTrashQueries(queryClient)}
    />
  );
}
