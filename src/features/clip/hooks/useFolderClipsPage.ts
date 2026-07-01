"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  createImageClip,
  createTextClip,
  likeClip,
  recordClipView,
  removeClip,
  unlikeClip,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { useInfiniteClips } from "@/features/clip/hooks/useInfiniteClips";
import { Clip } from "@/features/clip/model/clip";
import { copyClipToClipboard } from "@/features/clip/service/clipClipboard";
import {
  addOptimisticClipToCache,
  cancelClipQueries,
  invalidateClipQueries,
  mapClipResponseToListItem,
  removeClipsFromCache,
  replaceOptimisticClipInCache,
  moveClipToRecentCache,
  updateClipFavoriteCache,
} from "@/features/clip/service/clipQueryCache";
import {
  isAllowedImageClipFile,
  isUnsupportedImageClipError,
  UNSUPPORTED_IMAGE_CLIP_MESSAGE,
} from "@/features/clip/service/imageClipValidation";
import { ClipListItemResponseDto } from "@/features/clip/model/clip.dto";
import { FilterType } from "@/features/clip/ui/FilterBar";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { waitForMinimumLoading } from "@/shared/lib/loading";
import { notifyError } from "@/shared/lib/toast";

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

export const useFolderClipsPage = () => {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const folderId = params?.id ?? "";
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [isActive, setIsActive] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const { copyToast, showCopyToast } = useCopyToast();
  const {
    clips,
    fetchNextPage,
    hasNextPage,
    isAuthenticated,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteClips({
    folderId,
    filter: activeFilter,
    searchQuery: debouncedSearchQuery,
    enabled: Boolean(folderId),
  });

  const refreshClipQueries = useCallback(
    () => invalidateClipQueries(queryClient),
    [queryClient],
  );

  useEffect(() => {
    const handleBlur = () => setIsActive(false);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-clip-menu]")) {
        return;
      }

      setContextMenu(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [contextMenu]);

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
      if (!trimmed || !folderId || !isAuthenticated) {
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
        void refreshClipQueries();
      }
    },
    [folderId, isAuthenticated, queryClient, refreshClipQueries],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (!folderId || !isAuthenticated) {
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
        const createdClip = await createImageClip({
          folderId,
          file,
        });

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
        void refreshClipQueries();
      }
    },
    [folderId, isAuthenticated, queryClient, refreshClipQueries],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isActive || !folderId || !ensureAuthenticated()) {
        return;
      }

      const clipboard = event.clipboardData;
      if (!clipboard) {
        return;
      }

      const items = Array.from(clipboard.items);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          void createImageClipFromPaste(file);
          return;
        }
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
  ]);

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      try {
        await copyClipToClipboard(clip);
      } catch {
        notifyError("클립을 복사하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      showCopyToast(event.clientX, event.clientY);

      if (isAuthenticated) {
        await recordClipView(clip.id);
        moveClipToRecentCache(queryClient, clip.id);
        void refreshClipQueries();
      }
    },
    [isAuthenticated, queryClient, refreshClipQueries, showCopyToast],
  );

  const handleCopyFromMenu = useCallback(
    async (clip: Clip) => {
      try {
        await copyClipToClipboard(clip);
      } catch {
        notifyError("클립을 복사하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (isAuthenticated) {
        await recordClipView(clip.id);
        moveClipToRecentCache(queryClient, clip.id);
        void refreshClipQueries();
      }

      setContextMenu(null);
    },
    [isAuthenticated, queryClient, refreshClipQueries],
  );

  const handleToggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!isAuthenticated) {
        return;
      }

      const nextFavorite = !clip.isFavorite;
      const rollbackFavorite = updateClipFavoriteCache(
        queryClient,
        clip.id,
        nextFavorite,
      );

      try {
        if (nextFavorite) {
          await likeClip(clip.id);
        } else {
          await unlikeClip(clip.id);
        }
      } catch {
        rollbackFavorite();
      } finally {
        void refreshClipQueries();
      }
    },
    [isAuthenticated, queryClient, refreshClipQueries],
  );

  const handleOpenContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => {
      event.preventDefault();
      setContextMenu({
        id: clip.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const handleDeleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated) {
        return;
      }

      await cancelClipQueries(queryClient);
      const rollbackDeletedClip = removeClipsFromCache(queryClient, [clipId]);
      setContextMenu(null);

      try {
        await removeClip(clipId);
      } catch {
        rollbackDeletedClip();
        notifyError("클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        void refreshClipQueries();
      }
    },
    [isAuthenticated, queryClient, refreshClipQueries],
  );

  const handleDeleteAll = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const clipIds = clips.map((clip) => clip.id);
    if (clipIds.length === 0) {
      setIsDeleteAllOpen(false);
      return;
    }

    await cancelClipQueries(queryClient);
    const rollbackDeletedClips = removeClipsFromCache(queryClient, clipIds);
    setIsDeleteAllOpen(false);

    try {
      await Promise.all(clipIds.map((clipId) => removeClip(clipId)));
    } catch {
      rollbackDeletedClips();
      notifyError("클립 전체 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      void refreshClipQueries();
    }
  }, [clips, isAuthenticated, queryClient, refreshClipQueries]);

  return {
    activeFilter,
    clips,
    contextMenu,
    copyToast,
    fetchNextPage,
    filteredClips: clips,
    hasClips: clips.length > 0,
    hasNextPage: Boolean(hasNextPage),
    isActive,
    isDeleteAllOpen,
    isError,
    isFetchingNextPage,
    isLoading: isPending,
    refetchClips: refetch,
    searchQuery,
    setActiveFilter,
    setContextMenu,
    setIsActive,
    setIsDeleteAllOpen,
    setSearchQuery,
    handleCopy,
    handleCopyFromMenu,
    handleDeleteAll,
    handleDeleteClip,
    handleOpenContextMenu,
    handleToggleFavorite,
  };
};
