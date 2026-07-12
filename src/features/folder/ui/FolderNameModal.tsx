"use client";

import { HiX } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";
import { TextInput } from "@/shared/ui/input/TextInput";
import { Modal } from "@/shared/ui/overlay/Modal";

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
    <Modal contentClassName="w-full max-w-sm">
      <div className="rounded-xl bg-(--surface-elevated) shadow-xl">
        <div className="flex items-center border-b border-(--border) px-5 py-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            aria-label={closeLabel}
          >
            <HiX className="h-5 w-5" aria-hidden />
          </Button>
          <p className="text-foreground ml-auto text-sm font-semibold">
            {title}
          </p>
        </div>

        <div className="px-5 py-4">
          <label className="text-muted block text-xs font-semibold">
            {fieldLabel}
          </label>
          <TextInput
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
            inputClassName="mt-2 rounded-lg px-3 py-2 focus:ring-0"
            placeholder={placeholder}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
          <Button onClick={onClose} variant="secondary" size="sm">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} variant="primary" size="sm">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
