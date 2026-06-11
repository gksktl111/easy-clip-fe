"use client";

import { HiX } from "react-icons/hi";

interface FolderNameModalProps {
  title: string;
  closeLabel: string;
  fieldLabel: string;
  placeholder: string;
  confirmLabel: string;
  cancelLabel: string;
  value: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function FolderNameModal({
  title,
  closeLabel,
  fieldLabel,
  placeholder,
  confirmLabel,
  cancelLabel,
  value,
  inputRef,
  onChange,
  onClose,
  onConfirm,
}: FolderNameModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
      <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
        <div className="flex items-center border-b border-(--border) px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground cursor-pointer rounded-full p-1 transition"
            aria-label={closeLabel}
          >
            <HiX className="h-5 w-5" aria-hidden />
          </button>
          <p className="text-foreground ml-auto text-sm font-semibold">
            {title}
          </p>
        </div>

        <div className="px-5 py-4">
          <label className="text-muted block text-xs font-semibold">
            {fieldLabel}
          </label>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onConfirm();
              } else if (event.key === "Escape") {
                onClose();
              }
            }}
            className="text-foreground mt-2 w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:outline-none"
            placeholder={placeholder}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="hover:text-foreground cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-primary-foreground cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium transition hover:bg-(--primary-hover)"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
