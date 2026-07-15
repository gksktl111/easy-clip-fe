"use client";

import {
  HiOutlineClipboardCopy,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import type { ClipContextMenuState } from "@/features/clip/hooks/useClipContextMenu";
import type { Clip } from "@/features/clip/model/clip";
import { ActionMenu } from "@/shared/ui/menu/ActionMenu";

// 선택한 클립 위치에 복사, 이름 변경, 삭제 액션 메뉴를 표시합니다.
interface ClipContextMenuProps {
  clips: Clip[];
  contextMenu: ClipContextMenuState | null;
  copyLabel: string;
  renameLabel?: string;
  deleteLabel: string;
  onCopy: (clip: Clip) => void;
  onRename?: (clip: Clip) => void;
  onDelete: (clipId: string) => void;
}

export function ClipContextMenu({
  clips,
  contextMenu,
  copyLabel,
  renameLabel,
  deleteLabel,
  onCopy,
  onRename,
  onDelete,
}: ClipContextMenuProps) {
  if (!contextMenu) {
    return null;
  }

  const targetClip = clips.find((clip) => clip.id === contextMenu.id);
  if (!targetClip || contextMenu.x === null || contextMenu.y === null) {
    return null;
  }

  return (
    <ActionMenu
      position="fixed"
      portal
      style={{ left: contextMenu.x, top: contextMenu.y }}
      dataAttribute="data-clip-menu"
      items={[
        {
          label: copyLabel,
          icon: <HiOutlineClipboardCopy className="h-4 w-4" aria-hidden />,
          onClick: () => onCopy(targetClip),
        },
        ...(renameLabel && onRename
          ? [
              {
                label: renameLabel,
                icon: <HiOutlinePencil className="h-4 w-4" aria-hidden />,
                onClick: () => onRename(targetClip),
              },
            ]
          : []),
        {
          label: deleteLabel,
          icon: <HiOutlineTrash className="h-4 w-4" aria-hidden />,
          tone: "danger",
          onClick: () => onDelete(targetClip.id),
        },
      ]}
    />
  );
}
