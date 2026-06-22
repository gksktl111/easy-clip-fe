"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  createImageClip,
  createTextClip,
  likeClip,
  recordClipView,
  removeClip,
  unlikeClip,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import {
  useInfiniteClips,
} from "@/features/clip/hooks/useInfiniteClips";
import { Clip } from "@/features/clip/model/clip";
import {
  invalidateClipQueries,
  updateClipFavoriteCache,
} from "@/features/clip/service/clipQueryCache";
import { FilterType } from "@/features/clip/ui/FilterBar";

export const useFolderClipsPage = () => {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const folderId = params?.id ?? "";
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    isFetchingNextPage,
    isPending,
  } = useInfiniteClips({
    folderId,
    filter: activeFilter,
    searchQuery,
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

      await createTextClip({
        folderId,
        text: trimmed,
      });
      await refreshClipQueries();
    },
    [folderId, isAuthenticated, refreshClipQueries],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (!folderId || !isAuthenticated) {
        return;
      }

      await createImageClip({
        folderId,
        file,
      });
      await refreshClipQueries();
    },
    [folderId, isAuthenticated, refreshClipQueries],
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
      showCopyToast(event.clientX, event.clientY);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      if (isAuthenticated) {
        await recordClipView(clip.id);
      }
    },
    [isAuthenticated, showCopyToast],
  );

  const handleCopyFromMenu = useCallback(
    async (clip: Clip) => {
      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      if (isAuthenticated) {
        await recordClipView(clip.id);
      }

      setContextMenu(null);
    },
    [isAuthenticated],
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
      }
    },
    [isAuthenticated, queryClient],
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

      await removeClip(clipId);
      setContextMenu(null);
      await refreshClipQueries();
    },
    [isAuthenticated, refreshClipQueries],
  );

  const handleDeleteAll = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    await Promise.all(clips.map((clip) => removeClip(clip.id)));
    setIsDeleteAllOpen(false);
    await refreshClipQueries();
  }, [clips, isAuthenticated, refreshClipQueries]);

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
    isFetchingNextPage,
    isLoading: isPending,
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
