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
