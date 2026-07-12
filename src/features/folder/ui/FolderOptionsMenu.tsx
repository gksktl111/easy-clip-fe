"use client";

import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { ActionMenu } from "@/shared/ui/menu/ActionMenu";

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
      <ActionMenu
        dataAttribute="data-folder-options"
        items={[
          {
            label: renameLabel,
            icon: <HiOutlinePencil className="h-4 w-4" aria-hidden />,
            onClick: onRename,
          },
          {
            label: deleteLabel,
            icon: <HiOutlineTrash className="h-4 w-4" aria-hidden />,
            tone: "danger",
            onClick: onDelete,
          },
        ]}
      />
    </div>
  );
}
