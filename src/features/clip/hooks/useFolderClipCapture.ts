"use client";

import { useAuth } from "@/features/auth";
import {
  useCaptureDraftStore,
  type CaptureInput,
} from "@/features/clip/store/captureDraftStore";
import { isPolicyError } from "@/shared/access/policyError";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { user } = useAuth();
  const drafts = useCaptureDraftStore();
  const draft =
    drafts.ownerId === user?.id ? drafts.drafts[folderId] : undefined;
  const submitting = useRef(false);
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

  const submitInput = useCallback(
    async (input: CaptureInput) => {
      if (
        isDisabled ||
        submitting.current ||
        !folderId ||
        !user ||
        !isAuthenticated
      )
        return;
      const id = crypto.randomUUID();
      drafts.save(user.id, folderId, { id, input });
      submitting.current = true;
      try {
        if (input.type === "text") await createText(folderId, input.text);
        else await createImage(folderId, input.file);
        drafts.remove(user.id, folderId, id);
      } catch (error) {
        drafts.fail(user.id, folderId, id, error);
        if (!isPolicyError(error))
          notifyError(
            input.type === "text"
              ? t("textSaveFailed")
              : isUnsupportedImageClipError(error)
                ? t("unsupportedImage")
                : t("imageSaveFailed"),
          );
      } finally {
        submitting.current = false;
      }
    },
    [
      createText,
      createImage,
      drafts,
      folderId,
      isAuthenticated,
      isDisabled,
      t,
      user,
    ],
  );

  const createTextClipFromPaste = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (text) await submitInput({ type: "text", text });
    },
    [submitInput],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (!isAllowedImageClipFile(file)) {
        notifyError(t("unsupportedImage"));
        return;
      }
      await submitInput({ type: "image", file });
    },
    [submitInput, t],
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

      if (
        draft ||
        isDisabled ||
        !isActive ||
        !folderId ||
        !ensureAuthenticated()
      ) {
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
    draft,
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
    draft,
    retryDraft: () => {
      if (draft) void submitInput(draft.input);
    },
    discardDraft: () => {
      if (user && draft) drafts.remove(user.id, folderId, draft.id);
    },
  };
};
