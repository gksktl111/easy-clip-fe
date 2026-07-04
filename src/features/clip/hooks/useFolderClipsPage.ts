"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  createImageClip,
  createTextClip,
  fetchClips,
  likeClip,
  recordClipView,
  removeClip,
  removeClips,
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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeletingClips, setIsDeletingClips] = useState(false);
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(
    () => new Set(),
  );
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
    const availableClipIds = new Set(clips.map((clip) => clip.id));

    setSelectedClipIds((currentIds) => {
      const nextIds = new Set(
        [...currentIds].filter((clipId) => availableClipIds.has(clipId)),
      );

      return nextIds.size === currentIds.size ? currentIds : nextIds;
    });
  }, [clips]);

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
      if (isDeleteMode || isDeletingClips) {
        return;
      }

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
    [
      folderId,
      isAuthenticated,
      isDeleteMode,
      isDeletingClips,
      queryClient,
      refreshClipQueries,
    ],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (isDeleteMode || isDeletingClips) {
        return;
      }

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
    [
      folderId,
      isAuthenticated,
      isDeleteMode,
      isDeletingClips,
      queryClient,
      refreshClipQueries,
    ],
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
      if (isDeleteMode || isDeletingClips) {
        return;
      }

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
    [
      isAuthenticated,
      isDeleteMode,
      isDeletingClips,
      queryClient,
      refreshClipQueries,
      showCopyToast,
    ],
  );

  const handleCopyFromMenu = useCallback(
    async (clip: Clip) => {
      if (isDeleteMode || isDeletingClips) {
        return;
      }

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
    [isAuthenticated, isDeleteMode, isDeletingClips, queryClient, refreshClipQueries],
  );

  const handleToggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!isAuthenticated || isDeleteMode || isDeletingClips) {
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
    [
      isAuthenticated,
      isDeleteMode,
      isDeletingClips,
      queryClient,
      refreshClipQueries,
    ],
  );

  const handleOpenContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => {
      event.preventDefault();

      if (isDeleteMode || isDeletingClips) {
        return;
      }

      setContextMenu({
        id: clip.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [isDeleteMode, isDeletingClips],
  );

  const handleDeleteClip = useCallback(
    async (clipId: string) => {
      if (!isAuthenticated || isDeletingClips) {
        return;
      }

      setIsDeletingClips(true);
      await cancelClipQueries(queryClient);
      const rollbackDeletedClip = removeClipsFromCache(queryClient, [clipId]);
      setContextMenu(null);

      try {
        await removeClip(clipId);
      } catch {
        rollbackDeletedClip();
        notifyError("클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsDeletingClips(false);
        void refreshClipQueries();
      }
    },
    [isAuthenticated, isDeletingClips, queryClient, refreshClipQueries],
  );

  const deleteClipsByIds = useCallback(
    async (clipIds: string[], errorMessage: string) => {
      if (!isAuthenticated || isDeletingClips) {
        return false;
      }

      const uniqueClipIds = [...new Set(clipIds)];
      if (uniqueClipIds.length === 0) {
        return false;
      }

      setIsDeletingClips(true);
      await cancelClipQueries(queryClient);
      const rollbackDeletedClips = removeClipsFromCache(queryClient, uniqueClipIds);

      try {
        await removeClips({ clipIds: uniqueClipIds });
        return true;
      } catch {
        rollbackDeletedClips();
        notifyError(errorMessage);
        return false;
      } finally {
        setIsDeletingClips(false);
        void refreshClipQueries();
      }
    },
    [isAuthenticated, isDeletingClips, queryClient, refreshClipQueries],
  );

  const fetchAllFolderClipIds = useCallback(async () => {
    const clipIds: string[] = [];
    let cursor: string | null = null;

    do {
      const response = await fetchClips({
        folderId,
        type: "ALL",
        cursor,
      });

      clipIds.push(...response.items.map((clip) => clip.id));
      cursor = response.hasMore ? response.nextCursor : null;
    } while (cursor);

    return clipIds;
  }, [folderId]);

  const handleEnterDeleteMode = useCallback(() => {
    if (!isAuthenticated || clips.length === 0 || isDeletingClips) {
      return;
    }

    setContextMenu(null);
    setIsActive(false);
    setIsDeleteMode(true);
    setSelectedClipIds(new Set());
  }, [clips.length, isAuthenticated, isDeletingClips]);

  const handleCancelDeleteMode = useCallback(() => {
    if (isDeletingClips) {
      return;
    }

    setIsDeleteMode(false);
    setSelectedClipIds(new Set());
  }, [isDeletingClips]);

  const handleToggleClipSelected = useCallback(
    (clipId: string) => {
      if (!isDeleteMode || isDeletingClips) {
        return;
      }

      setSelectedClipIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(clipId)) {
          nextIds.delete(clipId);
        } else {
          nextIds.add(clipId);
        }

        return nextIds;
      });
    },
    [isDeleteMode, isDeletingClips],
  );

  const handleDeleteSelected = useCallback(async () => {
    const clipIds = [...selectedClipIds];
    if (clipIds.length === 0) {
      return;
    }

    const isDeleted = await deleteClipsByIds(
      clipIds,
      "선택한 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
    );

    if (isDeleted) {
      setSelectedClipIds(new Set());
      setIsDeleteMode(false);
    }
  }, [deleteClipsByIds, selectedClipIds]);

  const handleDeleteAll = useCallback(async () => {
    if (!isAuthenticated || isDeletingClips || !folderId) {
      return;
    }

    setIsDeleteAllOpen(false);
    setIsDeletingClips(true);

    try {
      const clipIds = await fetchAllFolderClipIds();

      if (clipIds.length === 0) {
        setIsDeleteMode(false);
        setSelectedClipIds(new Set());
        return;
      }

      const uniqueClipIds = [...new Set(clipIds)];
      await cancelClipQueries(queryClient);
      const rollbackDeletedClips = removeClipsFromCache(queryClient, uniqueClipIds);

      try {
        await removeClips({ clipIds: uniqueClipIds });
        setSelectedClipIds(new Set());
        setIsDeleteMode(false);
      } catch {
        rollbackDeletedClips();
        notifyError(
          "현재 폴더의 모든 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
    } catch {
      notifyError("현재 폴더의 모든 클립 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeletingClips(false);
      void refreshClipQueries();
    }
  }, [
    fetchAllFolderClipIds,
    folderId,
    isAuthenticated,
    isDeletingClips,
    queryClient,
    refreshClipQueries,
  ]);

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
    isDeleteMode,
    isDeletingClips,
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
    selectedClipCount: selectedClipIds.size,
    selectedClipIds,
    handleCopy,
    handleCopyFromMenu,
    handleCancelDeleteMode,
    handleDeleteAll,
    handleDeleteClip,
    handleDeleteSelected,
    handleEnterDeleteMode,
    handleOpenContextMenu,
    handleToggleClipSelected,
    handleToggleFavorite,
  };
};
