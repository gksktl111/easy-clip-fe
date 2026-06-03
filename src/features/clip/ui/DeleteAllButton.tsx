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
      className="absolute right-6 bottom-6 rounded-full bg-(--danger) px-4 py-2 text-sm font-semibold text-danger-foreground shadow-lg transition hover:bg-(--danger-hover) disabled:cursor-not-allowed disabled:opacity-50"
    >
      Delete All
    </button>
  );
}
