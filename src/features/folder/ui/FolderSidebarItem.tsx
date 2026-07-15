"use client";

import Link from "next/link";
import {
  HiOutlineDotsVertical,
  HiOutlineFolder,
  HiOutlineMenuAlt4,
} from "react-icons/hi";
import type { FolderItem } from "@/features/folder/model/folder";
import { FolderOptionsMenu } from "@/features/folder/ui/FolderOptionsMenu";

// 폴더 하나의 탐색, 순서 변경, 옵션 메뉴와 드롭 위치를 렌더링합니다.
interface FolderSidebarItemProps {
  canMoveDown: boolean;
  canMoveUp: boolean;
  deleteLabel: string;
  draggingFolderId: string | null;
  dropIndicatorEdge: "top" | "bottom" | null;
  folder: FolderItem;
  isOptionsOpen: boolean;
  optionsMenuPosition: { x: number; y: number } | null;
  onDelete: () => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLLIElement>) => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDrop: (event: React.DragEvent<HTMLLIElement>) => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onNavigate?: () => void;
  onOpenOptionsMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  onRename: () => void;
  onToggleOptions: (event: React.MouseEvent<HTMLButtonElement>) => void;
  moveFolderDownLabel: string;
  moveFolderUpLabel: string;
  openFolderOptionsLabel: string;
  pathname: string;
  renameLabel: string;
  reorderFolderLabel: string;
}

export function FolderSidebarItem({
  canMoveDown,
  canMoveUp,
  deleteLabel,
  draggingFolderId,
  dropIndicatorEdge,
  folder,
  isOptionsOpen,
  optionsMenuPosition,
  onDelete,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onMoveDown,
  onMoveUp,
  onNavigate,
  onOpenOptionsMenu,
  onRename,
  onToggleOptions,
  moveFolderDownLabel,
  moveFolderUpLabel,
  openFolderOptionsLabel,
  pathname,
  renameLabel,
  reorderFolderLabel,
}: FolderSidebarItemProps) {
  const isDragging = Boolean(draggingFolderId);
  const isDraggedItem = draggingFolderId === folder.id;
  const isActiveFolder = pathname === `/${folder.id}`;
  const isDropTarget = dropIndicatorEdge !== null;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    // 링크나 옵션 버튼에 포커스가 있어도 폴더 항목 단위 단축키로 순서를 바꿀 수 있게 버블링을 받습니다.
    if (!event.ctrlKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (canMoveUp) {
        onMoveUp();
      }
      return;
    }

    event.preventDefault();
    if (canMoveDown) {
      onMoveDown();
    }
  };

  return (
    <li
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={handleKeyDown}
      className={`relative rounded-lg ${isDraggedItem ? "opacity-50" : ""}`}
    >
      {dropIndicatorEdge ? (
        <span
          className={`pointer-events-none absolute right-2 left-2 z-10 h-0.5 rounded-full bg-(--focus-ring) opacity-100 shadow-[0_0_0_1px_var(--surface-muted)] transition-[opacity,transform] duration-150 ${
            dropIndicatorEdge === "top"
              ? "top-0 -translate-y-1/2"
              : "bottom-0 translate-y-1/2"
          }`}
          aria-hidden
        />
      ) : null}

      <div
        onContextMenu={onOpenOptionsMenu}
        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium ${
          isDragging ? "transition-colors duration-150" : "transition-colors"
        } ${
          isDropTarget
            ? "text-foreground bg-(--surface-elevated)"
            : isActiveFolder
              ? "text-foreground bg-(--surface)"
              : isDragging
                ? "text-muted"
                : "text-muted hover:text-foreground hover:bg-(--surface)"
        }`}
      >
        <button
          type="button"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={`text-muted cursor-grab rounded p-1 ${
            isDragging ? "" : "hover:text-foreground"
          }`}
          aria-label={reorderFolderLabel}
        >
          <HiOutlineMenuAlt4 className="h-4 w-4" aria-hidden />
        </button>

        <Link
          href={`/${folder.id}`}
          onClick={onNavigate}
          className="flex flex-1 items-center gap-2 truncate"
          aria-current={isActiveFolder ? "page" : undefined}
        >
          <HiOutlineFolder className="h-5 w-5" aria-hidden />
          <span className="truncate">{folder.name}</span>
        </Link>

        <button
          type="button"
          onClick={onToggleOptions}
          className={`text-muted cursor-pointer rounded p-1 ${
            isDragging ? "" : "hover:text-foreground transition"
          }`}
          aria-label={openFolderOptionsLabel}
          aria-expanded={isOptionsOpen}
          aria-haspopup="menu"
          data-folder-options
        >
          <HiOutlineDotsVertical className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {isOptionsOpen ? (
        <FolderOptionsMenu
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          moveFolderUpLabel={moveFolderUpLabel}
          moveFolderDownLabel={moveFolderDownLabel}
          // 우클릭 메뉴는 커서 좌표에 fixed로 띄우고, 옵션 버튼 메뉴는 기존 위치에 absolute로 띄웁니다.
          position={optionsMenuPosition}
          renameLabel={renameLabel}
          deleteLabel={deleteLabel}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRename={onRename}
          onDelete={onDelete}
        />
      ) : null}
    </li>
  );
}
