"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  getClipNameLength,
  MAX_CLIP_NAME_LENGTH,
} from "@/features/clip/service/clipNameValidation";
import { NameInputModal } from "@/shared/ui/overlay/NameInputModal";

interface ClipRenameModalProps {
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClipRenameModal(props: ClipRenameModalProps) {
  const t = useTranslations("clips");
  const length = getClipNameLength(props.value);
  const isTooLong = length > MAX_CLIP_NAME_LENGTH;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  return (
    <NameInputModal
      {...props}
      inputRef={inputRef}
      helperText={t("renameModal.hint", { max: MAX_CLIP_NAME_LENGTH })}
      characterCount={t("renameModal.count", {
        count: length,
        max: MAX_CLIP_NAME_LENGTH,
      })}
      errorMessage={
        isTooLong
          ? t("renameModal.tooLong", { max: MAX_CLIP_NAME_LENGTH })
          : undefined
      }
      title={t("renameModal.title")}
      closeLabel={t("renameModal.close")}
      fieldLabel={t("renameModal.field")}
      placeholder={t("renameModal.placeholder")}
      confirmLabel={t("actions.change")}
      cancelLabel={t("actions.cancel")}
    />
  );
}
