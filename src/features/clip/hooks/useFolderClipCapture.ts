"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCreateClipMutation } from "@/features/clip/mutations/useCreateClipMutation";
import {
  isAllowedImageClipFile,
  isUnsupportedImageClipError,
} from "@/features/clip/service/imageClipValidation";
import { notifyError } from "@/shared/feedback/toast";

interface UseFolderClipCaptureOptions {
  folderId: string;
  isAuthenticated: boolean;
  isDisabled?: boolean;
}

// 폴더 화면 활성 상태와 paste listener, 생성 mutation 연결을 관리합니다.
export const useFolderClipCapture = ({
  folderId,
  isAuthenticated,
  isDisabled = false,
}: UseFolderClipCaptureOptions) => {
  const router = useRouter();
  const t = useTranslations("clips.captureErrors");
  const {
    createImage,
    createText,
    isPending: isCreating,
  } = useCreateClipMutation();
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    if (!isDisabled) {
      setIsActive(true);
    }
  }, [isDisabled]);
  const deactivate = useCallback(() => setIsActive(false), []);

  useEffect(() => {
    window.addEventListener("blur", deactivate);
    return () => window.removeEventListener("blur", deactivate);
  }, [deactivate]);

  const ensureAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }

    router.push("/login");
    return false;
  }, [isAuthenticated, router]);

  const createTextClipFromPaste = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (
        isDisabled ||
        isCreating ||
        !trimmed ||
        !folderId ||
        !isAuthenticated
      ) {
        return;
      }

      try {
        await createText(folderId, trimmed);
      } catch {
        notifyError(t("textSaveFailed"));
      }
    },
    [createText, folderId, isAuthenticated, isCreating, isDisabled, t],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (isDisabled || isCreating || !folderId || !isAuthenticated) {
        return;
      }

      if (!isAllowedImageClipFile(file)) {
        notifyError(t("unsupportedImage"));
        return;
      }

      try {
        await createImage(folderId, file);
      } catch (error) {
        notifyError(
          isUnsupportedImageClipError(error)
            ? t("unsupportedImage")
            : t("imageSaveFailed"),
        );
      }
    },
    [createImage, folderId, isAuthenticated, isCreating, isDisabled, t],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input, textarea") || target.isContentEditable)
      ) {
        return;
      }

      if (isDisabled || !isActive || !folderId || !ensureAuthenticated()) {
        return;
      }

      const clipboard = event.clipboardData;
      if (!clipboard) {
        return;
      }

      const imageItem = Array.from(clipboard.items).find((item) =>
        item.type.startsWith("image/"),
      );
      const imageFile = imageItem?.getAsFile();

      if (imageFile) {
        void createImageClipFromPaste(imageFile);
        return;
      }

      const text = clipboard.getData("text");
      if (text) {
        void createTextClipFromPaste(text);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [
    createImageClipFromPaste,
    createTextClipFromPaste,
    ensureAuthenticated,
    folderId,
    isActive,
    isDisabled,
  ]);

  return {
    activate,
    deactivate,
    isActive,
    isCreating,
  };
};
