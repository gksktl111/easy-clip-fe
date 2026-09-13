"use client";

import { useId } from "react";
import { HiX } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";
import { TextInput } from "@/shared/ui/input/TextInput";
import { Modal } from "@/shared/ui/overlay/Modal";

// 이름을 입력하는 생성·변경 화면의 공통 모달입니다.
interface NameInputModalProps {
  title: string;
  closeLabel: string;
  fieldLabel: string;
  placeholder: string;
  confirmLabel: string;
  cancelLabel: string;
  isSubmitting?: boolean;
  helperText?: string;
  errorMessage?: string;
  characterCount?: string;
  value: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function NameInputModal({
  title,
  closeLabel,
  fieldLabel,
  placeholder,
  confirmLabel,
  cancelLabel,
  isSubmitting = false,
  helperText,
  errorMessage,
  characterCount,
  value,
  inputRef,
  onChange,
  onClose,
  onConfirm,
}: NameInputModalProps) {
  const inputId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const hasDescription = Boolean(helperText || errorMessage || characterCount);
  const isConfirmDisabled =
    isSubmitting || !value.trim() || Boolean(errorMessage);
  return (
    <Modal
      labelledBy={titleId}
      contentClassName="w-full max-w-sm"
      onEscape={isSubmitting ? undefined : onClose}
    >
      <div className="rounded-xl bg-(--surface-elevated) shadow-xl">
        <div className="flex items-center border-b border-(--border) px-5 py-4">
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            aria-label={closeLabel}
          >
            <HiX className="h-5 w-5" aria-hidden />
          </Button>
          <p
            id={titleId}
            className="text-foreground ml-auto text-sm font-semibold"
          >
            {title}
          </p>
        </div>

        <div className="px-5 py-4">
          <label
            htmlFor={inputId}
            className="text-muted block text-xs font-semibold"
          >
            {fieldLabel}
          </label>
          <TextInput
            id={inputId}
            disabled={isSubmitting}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={hasDescription ? descriptionId : undefined}
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || isSubmitting) return;
              if (event.key === "Enter" && !isConfirmDisabled) {
                onConfirm();
              } else if (event.key === "Escape") {
                onClose();
              }
            }}
            inputClassName="mt-2 rounded-lg px-3 py-2 focus:ring-0"
            placeholder={placeholder}
          />
          {hasDescription ? (
            <div
              id={descriptionId}
              className="mt-2 flex items-start justify-between gap-3 text-xs"
            >
              <span
                className={errorMessage ? "text-(--danger)" : "text-(--muted)"}
                aria-live="polite"
              >
                {errorMessage || helperText}
              </span>
              {characterCount ? (
                <span className="shrink-0 text-(--muted) tabular-nums">
                  {characterCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={isConfirmDisabled}
            onClick={onConfirm}
            variant="primary"
            size="sm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
