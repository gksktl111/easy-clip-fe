"use client";

import { HiCheck } from "react-icons/hi";
import {
  TAG_BACKGROUND_COLORS,
  type TagBackgroundColor,
} from "@/features/clip/model/tag";

interface TagColorPickerProps {
  disabled?: boolean;
  getColorLabel: (color: TagBackgroundColor) => string;
  label: string;
  onChange: (color: TagBackgroundColor) => void;
  value: TagBackgroundColor;
}

export function TagColorPicker({
  disabled = false,
  getColorLabel,
  label,
  onChange,
  value,
}: TagColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {TAG_BACKGROUND_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color)}
          className="tag-color flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-black/5 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-default disabled:opacity-50"
          data-tag-color={color}
          role="radio"
          aria-checked={value === color}
          aria-label={getColorLabel(color)}
          title={getColorLabel(color)}
        >
          {value === color ? <HiCheck className="h-4 w-4" aria-hidden /> : null}
        </button>
      ))}
    </div>
  );
}
