"use client";

interface DeleteAllClipsModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAllClipsModal({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: DeleteAllClipsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
      <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
        <div className="border-b border-(--border) px-5 py-4">
          <p className="text-foreground text-sm font-semibold">{title}</p>
          <p className="text-muted mt-1 text-xs">{description}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-foreground rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-(--danger) px-4 py-2 text-sm font-medium text-danger-foreground transition hover:bg-(--danger-hover)"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
