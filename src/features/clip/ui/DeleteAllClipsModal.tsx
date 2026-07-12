"use client";

import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

interface DeleteAllClipsModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAllClipsModal({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  isConfirming = false,
  onCancel,
  onConfirm,
}: DeleteAllClipsModalProps) {
  return (
    <Modal isOpen={isOpen} contentClassName="w-full max-w-sm">
      <div className="rounded-xl bg-(--surface-elevated) shadow-xl">
        <div className="border-b border-(--border) px-5 py-4">
          <p className="text-foreground text-sm font-semibold">{title}</p>
          <p className="text-muted mt-1 text-xs">{description}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <Button
            disabled={isConfirming}
            onClick={onCancel}
            variant="secondary"
            size="sm"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={isConfirming}
            onClick={onConfirm}
            variant="danger"
            size="sm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
