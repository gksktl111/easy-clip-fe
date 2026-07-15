import type {
  FolderDropPosition,
  FolderItem,
} from "@/features/folder/model/folder";
import type { FolderResponseDto } from "@/features/folder/model/folder.dto";

export const mapFolder = (folder: FolderResponseDto): FolderItem => ({
  id: folder.id,
  name: folder.name,
  order: folder.order,
});

export const sortFolders = (folders: FolderItem[]) =>
  [...folders].sort((left, right) => left.order - right.order);

export const reorderFolderItems = (
  folders: FolderItem[],
  sourceId: string,
  targetId: string,
  position: FolderDropPosition,
) => {
  if (sourceId === targetId) {
    return folders;
  }

  const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
  const targetIndex = folders.findIndex((folder) => folder.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return folders;
  }

  const nextFolders = [...folders];
  const [sourceFolder] = nextFolders.splice(sourceIndex, 1);

  if (!sourceFolder) {
    return folders;
  }

  const adjustedTargetIndex = nextFolders.findIndex(
    (folder) => folder.id === targetId,
  );

  if (adjustedTargetIndex === -1) {
    return folders;
  }

  nextFolders.splice(
    position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex,
    0,
    sourceFolder,
  );

  const isSameOrder = nextFolders.every(
    (folder, index) => folder.id === folders[index]?.id,
  );

  if (isSameOrder) {
    return folders;
  }

  return nextFolders.map((folder, index) => ({
    ...folder,
    order: index,
  }));
};

export const getFolderKeyboardMoveTarget = (
  folders: FolderItem[],
  sourceId: string,
  direction: "up" | "down",
): { targetId: string; position: FolderDropPosition } | null => {
  // 키보드 이동도 드래그 정렬 API와 같은 targetId + before/after 계약으로 변환합니다.
  const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);

  if (sourceIndex === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
  const targetFolder = folders[targetIndex];

  if (!targetFolder) {
    return null;
  }

  return {
    targetId: targetFolder.id,
    position: direction === "up" ? "before" : "after",
  };
};
