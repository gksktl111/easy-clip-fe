import type {
  FolderDropPosition,
  FolderItem,
} from "@/features/folder/model/folder";

export interface FolderDropTarget {
  targetId: string;
  position: FolderDropPosition;
  indicatorFolderId: string;
  indicatorEdge: "top" | "bottom";
}

// 행 중앙에 놓아도 인접 이동이 가능하도록 출발 행과 대상 행의 순서로 판정합니다.
export const getFolderDropTarget = (
  folders: FolderItem[],
  sourceId: string | null,
  targetId: string,
): FolderDropTarget | null => {
  if (!sourceId || sourceId === targetId) return null;
  const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
  const targetIndex = folders.findIndex((folder) => folder.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return null;

  const movesUp = sourceIndex > targetIndex;
  return {
    targetId,
    position: movesUp ? "before" : "after",
    indicatorFolderId: targetId,
    indicatorEdge: movesUp ? "top" : "bottom",
  };
};
