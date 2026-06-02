"use client";

interface DeleteAllButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export function DeleteAllButton({
  disabled = false,
  onClick,
}: DeleteAllButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="absolute right-6 bottom-6 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
    >
      Delete All
    </button>
  );
}
