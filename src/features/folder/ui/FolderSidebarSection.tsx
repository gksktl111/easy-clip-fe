"use client";

import type { FolderItem } from "@/features/folder/model/folder";
import { HiOutlinePlus } from "react-icons/hi";
import { FolderSidebarItem } from "@/features/folder/ui/FolderSidebarItem";
import type { ContextMenuState } from "@/shared/hooks/useContextMenu";

// 폴더 추가 액션과 로딩 또는 폴더 목록 상태를 사이드바 섹션으로 조합합니다.
interface FolderSidebarSectionProps {
  folders: FolderItem[];
  isLoading?: boolean;
  pathname: string;
  addFolderLabel: string;
  reorderFolderLabel: string;
  moveFolderUpLabel: string;
  moveFolderDownLabel: string;
  openFolderOptionsLabel: string;
  renameLabel: string;
  deleteLabel: string;
  folderOrderStatus: string;
  optionsMenu: ContextMenuState<string> | null;
  draggingFolderId: string | null;
  dropIndicator: {
    folderId: string;
    edge: "top" | "bottom";
  } | null;
  onAddFolder: () => void;
  onNavigate?: () => void;
  onDragStart: (
    folderId: string,
    event: React.DragEvent<HTMLButtonElement>,
  ) => void;
  onDragEnd: () => void;
  onDragOver: (folderId: string, event: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (folderId: string, event: React.DragEvent<HTMLLIElement>) => void;
  onMoveFolderUp: (folderId: string) => void;
  onMoveFolderDown: (folderId: string) => void;
  onToggleOptions: (
    folderId: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onOpenOptionsMenu: (event: React.MouseEvent, folderId: string) => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export function FolderSidebarSection({
  folders,
  isLoading = false,
  pathname,
  addFolderLabel,
  reorderFolderLabel,
  moveFolderUpLabel,
  moveFolderDownLabel,
  openFolderOptionsLabel,
  renameLabel,
  deleteLabel,
  folderOrderStatus,
  optionsMenu,
  draggingFolderId,
  dropIndicator,
  onAddFolder,
  onNavigate,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMoveFolderUp,
  onMoveFolderDown,
  onToggleOptions,
  onOpenOptionsMenu,
  onRenameFolder,
  onDeleteFolder,
}: FolderSidebarSectionProps) {
  const skeletonRows = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="space-y-2 border-t border-(--border) pt-4">
      <button
        type="button"
        onClick={onAddFolder}
        className="hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-(--muted) transition-colors hover:bg-(--surface)"
      >
        <HiOutlinePlus className="h-5 w-5" aria-hidden />
        {addFolderLabel}
      </button>

      <ul className="space-y-1 px-2">
        {isLoading
          ? skeletonRows.map((row) => <FolderSidebarSkeletonRow key={row} />)
          : folders.map((folder, index) => (
              <FolderSidebarItem
                key={folder.id}
                folder={folder}
                pathname={pathname}
                reorderFolderLabel={reorderFolderLabel}
                moveFolderUpLabel={moveFolderUpLabel}
                moveFolderDownLabel={moveFolderDownLabel}
                openFolderOptionsLabel={openFolderOptionsLabel}
                renameLabel={renameLabel}
                deleteLabel={deleteLabel}
                canMoveUp={index > 0}
                canMoveDown={index < folders.length - 1}
                draggingFolderId={draggingFolderId}
                dropIndicatorEdge={
                  dropIndicator?.folderId === folder.id
                    ? dropIndicator.edge
                    : null
                }
                isOptionsOpen={optionsMenu?.id === folder.id}
                optionsMenuPosition={
                  optionsMenu?.id === folder.id &&
                  optionsMenu.x !== null &&
                  optionsMenu.y !== null
                    ? { x: optionsMenu.x, y: optionsMenu.y }
                    : null
                }
                onNavigate={onNavigate}
                onDragStart={(event) => onDragStart(folder.id, event)}
                onDragEnd={onDragEnd}
                onDragOver={(event) => onDragOver(folder.id, event)}
                onDrop={(event) => onDrop(folder.id, event)}
                onMoveUp={() => onMoveFolderUp(folder.id)}
                onMoveDown={() => onMoveFolderDown(folder.id)}
                onToggleOptions={(event) => onToggleOptions(folder.id, event)}
                onOpenOptionsMenu={(event) => onOpenOptionsMenu(event, folder.id)}
                onRename={() => onRenameFolder(folder.id)}
                onDelete={() => onDeleteFolder(folder.id)}
              />
            ))}
      </ul>
      <p className="sr-only" role="status" aria-live="polite">
        {folderOrderStatus}
      </p>
    </div>
  );
}

function FolderSidebarSkeletonRow() {
  return (
    <li className="rounded-lg px-2 py-2" aria-hidden>
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer h-6 w-6 rounded-md" />
        <div className="skeleton-shimmer h-5 w-5 rounded-md" />
        <div className="skeleton-shimmer h-4 flex-1 rounded-md" />
        <div className="skeleton-shimmer h-6 w-6 rounded-md" />
      </div>
    </li>
  );
}
