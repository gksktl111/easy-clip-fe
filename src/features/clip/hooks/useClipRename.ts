"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Clip } from "@/features/clip/model/clip";
import { useClipRenameMutation } from "@/features/clip/mutations/useClipRenameMutation";
import { isValidClipName } from "@/features/clip/service/clipNameValidation";
import { notifyError } from "@/shared/feedback/toast";

export const useClipRename = (isAuthenticated: boolean) => {
  const t = useTranslations("clips.renameModal");
  const [clip, setClip] = useState<Clip | null>(null);
  const [value, setValue] = useState("");
  const submitting = useRef(false);
  const mutation = useClipRenameMutation();

  const open = (target: Clip) => {
    if (!isAuthenticated || submitting.current) return;
    setClip(target);
    setValue(target.name);
  };
  const close = () => {
    if (!submitting.current) setClip(null);
  };
  const confirm = async () => {
    const title = value.trim();
    if (
      !isAuthenticated ||
      !clip ||
      !isValidClipName(title) ||
      submitting.current
    )
      return;
    if (title === clip.name) {
      close();
      return;
    }
    submitting.current = true;
    try {
      await mutation.mutateAsync({ clipId: clip.id, title });
      setClip(null);
    } catch {
      notifyError(t("error"));
    } finally {
      submitting.current = false;
    }
  };

  return {
    isOpen: clip !== null,
    isSubmitting: mutation.isPending,
    value,
    onChange: setValue,
    onClose: close,
    onConfirm: confirm,
    open,
  };
};
