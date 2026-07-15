"use client";

import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import { ActionMenu } from "@/shared/ui/menu/ActionMenu";

// 폴더 이름 변경과 삭제 액션을 컨텍스트 메뉴로 제공합니다.
interface FolderOptionsMenuProps {
  canMoveDown: boolean;
  canMoveUp: boolean;
  position?: { x: number; y: number } | null;
  renameLabel: string;
  deleteLabel: string;
  moveFolderDownLabel: string;
  moveFolderUpLabel: string;
  onRename: () => void;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
}

export function FolderOptionsMenu({
  canMoveDown,
  canMoveUp,
  position,
  renameLabel,
  deleteLabel,
  moveFolderDownLabel,
  moveFolderUpLabel,
  onRename,
  onDelete,
  onMoveDown,
  onMoveUp,
}: FolderOptionsMenuProps) {
  return (
    <div className="relative">
      <ActionMenu
        dataAttribute="data-folder-options"
        className="w-48"
        position={position ? "fixed" : "absolute"}
        portal={Boolean(position)}
        style={position ? { left: position.x, top: position.y } : undefined}
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
          {
            label: moveFolderUpLabel,
            icon: <HiOutlineArrowUp className="h-4 w-4" aria-hidden />,
            shortcut: "Ctrl + ↑",
            disabled: !canMoveUp,
            onClick: onMoveUp,
          },
          {
            label: moveFolderDownLabel,
            icon: <HiOutlineArrowDown className="h-4 w-4" aria-hidden />,
            shortcut: "Ctrl + ↓",
            disabled: !canMoveDown,
            onClick: onMoveDown,
          },
        ]}
      />
    </div>
  );
}
