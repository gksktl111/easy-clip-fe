"use client";

import { HiOutlineTrash } from "react-icons/hi";

interface DeleteAllButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function DeleteAllButton({ disabled = true, onClick }: DeleteAllButtonProps) {
  return (
    <div className="flex justify-center border-t border-gray-200 px-6 py-4">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`group flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          disabled
            ? "cursor-not-allowed text-gray-400"
            : "cursor-pointer text-gray-700 hover:text-red-600"
        }`}
      >
        <span>Delete All Clips</span>
        <HiOutlineTrash
          className={`h-5 w-5 transition-colors duration-200 ${
            disabled ? "text-gray-400" : "text-gray-700 group-hover:text-red-600"
          }`}
          aria-hidden
        />
      </button>
    </div>
  );
}
