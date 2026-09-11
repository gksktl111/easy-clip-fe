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
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { readCurrentClipboard } from "@/features/clip/service/readCurrentClipboard";

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
  const feedback = useTranslations("feedback");
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
  const [isReadingClipboard, setIsReadingClipboard] = useState(false);
  const readingClipboard = useRef(false);
  const captureGeneration = useRef(0);

  useEffect(() => {
    return () => {
      // 읽기 권한 대기 중 계정·폴더·접근 상태 변경 시 저장을 취소합니다.
      captureGeneration.current += 1;
    };
  }, [folderId, user?.id, isDisabled]);

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
    async (
      input: CaptureInput,
      allowExistingDraft = false,
    ): Promise<boolean> => {
      if (
        isDisabled ||
        submitting.current ||
        (draft && !allowExistingDraft) ||
        !folderId ||
        !user ||
        !isAuthenticated
      )
        return false;
      const id = crypto.randomUUID();
      drafts.save(user.id, folderId, { id, input });
      submitting.current = true;
      try {
        if (input.type === "text") await createText(folderId, input.text);
        else await createImage(folderId, input.file);
        drafts.remove(user.id, folderId, id);
        notifySuccess(feedback("saveSuccess"));
        return true;
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
        return false;
      } finally {
        submitting.current = false;
      }
    },
    [
      feedback,
      createText,
      createImage,
      draft,
      drafts,
      folderId,
      isAuthenticated,
      isDisabled,
      t,
      user,
    ],
  );

  const createTextClipFromPaste = useCallback(
    async (content: string): Promise<boolean> => {
      const text = content.trim();
      return text ? submitInput({ type: "text", text }) : false;
    },
    [submitInput],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File): Promise<boolean> => {
      if (!isAllowedImageClipFile(file)) {
        notifyError(t("unsupportedImage"));
        return false;
      }
      return submitInput({ type: "image", file });
    },
    [submitInput, t],
  );

  const pasteFromClipboard = useCallback(async (): Promise<boolean> => {
    if (isDisabled || draft || submitting.current || readingClipboard.current)
      return false;
    if (!ensureAuthenticated()) return false;
    readingClipboard.current = true;
    setIsReadingClipboard(true);
    const generation = captureGeneration.current;
    try {
      const result = await readCurrentClipboard();
      if (generation !== captureGeneration.current) return false;
      switch (result.kind) {
        case "image":
          return await createImageClipFromPaste(result.file);
        case "text":
          return await createTextClipFromPaste(result.text);
        case "empty":
          notifyError(t("clipboardEmpty"));
          break;
        case "unavailable":
          notifyError(t("clipboardUnavailable"));
          break;
        case "denied":
          notifyError(t("clipboardDenied"));
          break;
        case "unsupported":
          notifyError(t("clipboardUnsupported"));
          break;
        case "failed":
          notifyError(t("clipboardReadFailed"));
      }
      return false;
    } finally {
      readingClipboard.current = false;
      setIsReadingClipboard(false);
    }
  }, [
    isDisabled,
    draft,
    ensureAuthenticated,
    createImageClipFromPaste,
    createTextClipFromPaste,
    t,
  ]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest('input, textarea, [role="dialog"]') || target.isContentEditable)
      ) {
        return;
      }

      if (
        draft ||
        readingClipboard.current ||
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
    pasteFromClipboard,
    isReadingClipboard,
    isDisabled,
    isActive,
    isCreating,
    draft,
    retryDraft: () => {
      if (draft) void submitInput(draft.input, true);
    },
    discardDraft: () => {
      if (user && draft) drafts.remove(user.id, folderId, draft.id);
    },
  };
};
