"use client";

import { HiX } from "react-icons/hi";
import type { TagBackgroundColor } from "@/features/clip/model/tag";

interface TagChipProps {
  backgroundColor: TagBackgroundColor;
  name: string;
  onRemove?: () => void;
  removeLabel?: string;
}

export function TagChip({
  backgroundColor,
  name,
  onRemove,
  removeLabel,
}: TagChipProps) {
  return (
    <span
      className="tag-color inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      data-tag-color={backgroundColor}
    >
      <span className="truncate whitespace-pre">{name}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 transition hover:bg-black/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
          aria-label={removeLabel}
        >
          <HiX className="h-3 w-3" aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
