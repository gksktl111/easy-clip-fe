"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createImageClip, createTextClip } from "@/features/clip/api/clipApi";
import type { ClipListItemResponseDto } from "@/features/clip/model/clip.dto";
import {
  addOptimisticClipToCache,
  cancelClipQueries,
  invalidateClipQueries,
  mapClipResponseToListItem,
  replaceOptimisticClipInCache,
} from "@/features/clip/service/clipQueryCache";
import {
  isAllowedImageClipFile,
  isUnsupportedImageClipError,
  UNSUPPORTED_IMAGE_CLIP_MESSAGE,
} from "@/features/clip/service/imageClipValidation";
import { notifyError } from "@/shared/feedback/toast";
import { waitForMinimumLoading } from "@/shared/lib/loading";

interface UseFolderClipCaptureOptions {
  folderId: string;
  isAuthenticated: boolean;
  isDisabled?: boolean;
}

const createOptimisticClipId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `temp-${crypto.randomUUID()}`;
  }

  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createOptimisticTextClip = (
  folderId: string,
  text: string,
): ClipListItemResponseDto => {
  const createdAt = new Date().toISOString();

  return {
    id: createOptimisticClipId(),
    type: "TEXT",
    title: text.slice(0, 48),
    textContent: text,
    colorHex: null,
    imageUrl: null,
    workspaceId: "optimistic",
    folderId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    likeByMe: false,
    tags: [],
    isOptimistic: true,
  };
};

const createOptimisticImageClip = (
  folderId: string,
  file: File,
  previewUrl: string,
): ClipListItemResponseDto => {
  const createdAt = new Date().toISOString();

  return {
    id: createOptimisticClipId(),
    type: "IMAGE",
    title: file.name || "Uploading image",
    textContent: null,
    colorHex: null,
    imageUrl: previewUrl,
    workspaceId: "optimistic",
    folderId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    likeByMe: false,
    tags: [],
    isOptimistic: true,
  };
};

// 폴더 화면 활성 상태와 paste listener, 텍스트·이미지 optimistic 생성을 관리합니다.
export const useFolderClipCapture = ({
  folderId,
  isAuthenticated,
  isDisabled = false,
}: UseFolderClipCaptureOptions) => {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      if (isDisabled || !trimmed || !folderId || !isAuthenticated) {
        return;
      }

      const optimisticClip = createOptimisticTextClip(folderId, trimmed);
      await cancelClipQueries(queryClient);
      const rollbackOptimisticClip = addOptimisticClipToCache(
        queryClient,
        optimisticClip,
      );
      const optimisticStartedAt = Date.now();

      try {
        const createdClip = await createTextClip({
          folderId,
          text: trimmed,
        });

        await waitForMinimumLoading(optimisticStartedAt);
        replaceOptimisticClipInCache(
          queryClient,
          optimisticClip.id,
          mapClipResponseToListItem(createdClip),
        );
      } catch {
        await waitForMinimumLoading(optimisticStartedAt);
        rollbackOptimisticClip();
        notifyError("클립 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        void invalidateClipQueries(queryClient);
      }
    },
    [folderId, isAuthenticated, isDisabled, queryClient],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (isDisabled || !folderId || !isAuthenticated) {
        return;
      }

      if (!isAllowedImageClipFile(file)) {
        notifyError(UNSUPPORTED_IMAGE_CLIP_MESSAGE);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const optimisticClip = createOptimisticImageClip(
        folderId,
        file,
        previewUrl,
      );
      await cancelClipQueries(queryClient);
      const rollbackOptimisticClip = addOptimisticClipToCache(
        queryClient,
        optimisticClip,
      );
      const optimisticStartedAt = Date.now();

      try {
        const createdClip = await createImageClip({ folderId, file });

        await waitForMinimumLoading(optimisticStartedAt);
        replaceOptimisticClipInCache(
          queryClient,
          optimisticClip.id,
          mapClipResponseToListItem(createdClip),
        );
      } catch (error) {
        await waitForMinimumLoading(optimisticStartedAt);
        rollbackOptimisticClip();
        notifyError(
          isUnsupportedImageClipError(error)
            ? UNSUPPORTED_IMAGE_CLIP_MESSAGE
            : "이미지 클립 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
        void invalidateClipQueries(queryClient);
      }
    },
    [folderId, isAuthenticated, isDisabled, queryClient],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
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
  };
};
