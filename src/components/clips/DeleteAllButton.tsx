"use client";

import { HiOutlineTrash } from "react-icons/hi";

interface DeleteAllButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function DeleteAllButton({
  disabled = true,
  onClick,
}: DeleteAllButtonProps) {
  return (
    <div className="flex justify-center border-t border-(--border) px-6 py-4">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`group flex items-center gap-2 rounded-lg bg-(--surface-muted) px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          disabled
            ? "cursor-not-allowed text-(--muted)"
            : "text-foreground cursor-pointer hover:text-red-400"
        }`}
      >
        <span>Delete All Clips</span>
        <HiOutlineTrash
          className={`h-5 w-5 transition-colors duration-200 ${
            disabled
              ? "text-(--muted)"
              : "text-foreground group-hover:text-red-400"
          }`}
          aria-hidden
        />
      </button>
    </div>
  );
}
