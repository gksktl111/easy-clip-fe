"use client";

import Link from "next/link";
import type { FolderItem } from "@/features/folder/model/folder";
import {
  HiOutlineDotsVertical,
  HiOutlineFolder,
  HiOutlineMenuAlt4,
  HiOutlinePlus,
} from "react-icons/hi";
import { FolderOptionsMenu } from "@/features/folder/ui/FolderOptionsMenu";

interface FolderSidebarSectionProps {
  folders: FolderItem[];
  isLoading?: boolean;
  pathname: string;
  addFolderLabel: string;
  reorderFolderLabel: string;
  openFolderOptionsLabel: string;
  renameLabel: string;
  deleteLabel: string;
  openOptionsFolderId: string | null;
  draggingFolderId: string | null;
  dropTargetId: string | null;
  onAddFolder: () => void;
  onNavigate?: () => void;
  onDragStart: (
    folderId: string,
    event: React.DragEvent<HTMLButtonElement>,
  ) => void;
  onDragEnd: () => void;
  onDragOver: (folderId: string, event: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (folderId: string, event: React.DragEvent<HTMLLIElement>) => void;
  onToggleOptions: (folderId: string) => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export function FolderSidebarSection({
  folders,
  isLoading = false,
  pathname,
  addFolderLabel,
  reorderFolderLabel,
  openFolderOptionsLabel,
  renameLabel,
  deleteLabel,
  openOptionsFolderId,
  draggingFolderId,
  dropTargetId,
  onAddFolder,
  onNavigate,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onToggleOptions,
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
          : folders.map((folder) => {
              const isDragging = Boolean(draggingFolderId);
              const isActiveFolder = pathname === `/${folder.id}`;
              const isDropTarget = dropTargetId === folder.id;

              return (
                <li
                  key={folder.id}
                  onDragOver={(event) => onDragOver(folder.id, event)}
                  onDrop={(event) => onDrop(folder.id, event)}
                  className={`relative rounded-lg ${
                    draggingFolderId === folder.id ? "opacity-50" : ""
                  }`}
                >
                  {isDropTarget ? (
                    <span
                      className="pointer-events-none absolute right-2 bottom-0 left-2 z-10 h-0.5 translate-y-1/2 rounded-full bg-(--focus-ring) opacity-100 shadow-[0_0_0_1px_var(--surface-muted)] transition-[opacity,transform] duration-150"
                      aria-hidden
                    />
                  ) : null}

                  <div
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium ${
                      isDragging
                        ? "transition-colors duration-150"
                        : "transition-colors"
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
                      onDragStart={(event) => onDragStart(folder.id, event)}
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
                    >
                      <HiOutlineFolder className="h-5 w-5" aria-hidden />
                      <span className="truncate">{folder.name}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => onToggleOptions(folder.id)}
                      className={`text-muted cursor-pointer rounded p-1 ${
                        isDragging ? "" : "transition hover:text-foreground"
                      }`}
                      aria-label={openFolderOptionsLabel}
                      data-folder-options
                    >
                      <HiOutlineDotsVertical className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  {openOptionsFolderId === folder.id ? (
                    <FolderOptionsMenu
                      renameLabel={renameLabel}
                      deleteLabel={deleteLabel}
                      onRename={() => onRenameFolder(folder.id)}
                      onDelete={() => onDeleteFolder(folder.id)}
                    />
                  ) : null}
                </li>
              );
            })}
      </ul>
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
