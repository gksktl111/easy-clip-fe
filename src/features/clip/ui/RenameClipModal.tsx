"use client";

interface RenameClipModalProps {
  isOpen: boolean;
  title: string;
  label: string;
  placeholder: string;
  cancelLabel: string;
  confirmLabel: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RenameClipModal({
  isOpen,
  title,
  label,
  placeholder,
  cancelLabel,
  confirmLabel,
  inputRef,
  value,
  onChange,
  onCancel,
  onConfirm,
}: RenameClipModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
      <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
        <div className="border-b border-(--border) px-5 py-4">
          <p className="text-foreground text-sm font-semibold">{title}</p>
        </div>
        <div className="px-5 py-4">
          <label className="block text-xs font-semibold text-(--muted)">
            {label}
          </label>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="text-foreground mt-2 w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:outline-none"
            placeholder={placeholder}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-foreground cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-(--primary-hover)"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
