"use client";

import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

interface FolderOptionsMenuProps {
  renameLabel: string;
  deleteLabel: string;
  onRename: () => void;
  onDelete: () => void;
}

export function FolderOptionsMenu({
  renameLabel,
  deleteLabel,
  onRename,
  onDelete,
}: FolderOptionsMenuProps) {
  return (
    <div className="relative">
      <div
        className="absolute right-0 z-20 w-32 overflow-hidden rounded-lg border border-(--border) bg-(--surface) shadow-lg"
        data-folder-options
      >
        <button
          type="button"
          onClick={onRename}
          className="text-foreground flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-(--surface-muted)"
        >
          <HiOutlinePencil className="h-4 w-4" aria-hidden />
          {renameLabel}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-(--danger) hover:bg-(--surface-muted)"
        >
          <HiOutlineTrash className="h-4 w-4" aria-hidden />
          {deleteLabel}
        </button>
      </div>
    </div>
  );
}
