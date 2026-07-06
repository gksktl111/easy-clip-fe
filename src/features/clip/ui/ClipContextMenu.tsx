"use client";

import { Clip } from "@/features/clip/model/clip";

interface ClipContextMenuProps {
  clips: Clip[];
  contextMenu: {
    id: string;
    x: number;
    y: number;
  } | null;
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
  if (!targetClip) {
    return null;
  }

  return (
    <div
      className="fixed z-50 w-36 rounded-lg border border-(--border) bg-(--surface) p-1 text-xs text-(--muted) shadow-lg"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      data-clip-menu
    >
      <button
        type="button"
        onClick={() => onCopy(targetClip)}
        className="hover:text-foreground flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-(--muted) hover:bg-(--surface-muted)"
        data-clip-menu
      >
        {copyLabel}
      </button>
      {renameLabel && onRename ? (
        <button
          type="button"
          onClick={() => onRename(targetClip)}
          className="hover:text-foreground flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-(--muted) hover:bg-(--surface-muted)"
          data-clip-menu
        >
          {renameLabel}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onDelete(targetClip.id)}
        className="flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-(--danger) hover:bg-(--surface-muted)"
        data-clip-menu
      >
        {deleteLabel}
      </button>
    </div>
  );
}
