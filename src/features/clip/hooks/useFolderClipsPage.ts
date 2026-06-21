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
    accessToken,
    clips,
    fetchNextPage,
    hasNextPage,
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
    if (accessToken) {
      return true;
    }

    router.push("/login");
    return false;
  }, [accessToken, router]);

  const createTextClipFromPaste = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !folderId || !accessToken) {
        return;
      }

      await createTextClip(accessToken, {
        folderId,
        text: trimmed,
      });
      await refreshClipQueries();
    },
    [accessToken, folderId, refreshClipQueries],
  );

  const createImageClipFromPaste = useCallback(
    async (file: File) => {
      if (!folderId || !accessToken) {
        return;
      }

      await createImageClip(accessToken, {
        folderId,
        file,
      });
      await refreshClipQueries();
    },
    [accessToken, folderId, refreshClipQueries],
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

      if (accessToken) {
        await recordClipView(accessToken, clip.id);
      }
    },
    [accessToken, showCopyToast],
  );

  const handleCopyFromMenu = useCallback(
    async (clip: Clip) => {
      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      if (accessToken) {
        await recordClipView(accessToken, clip.id);
      }

      setContextMenu(null);
    },
    [accessToken],
  );

  const handleToggleFavorite = useCallback(
    async (clip: Clip) => {
      if (!accessToken) {
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
          await likeClip(accessToken, clip.id);
        } else {
          await unlikeClip(accessToken, clip.id);
        }
      } catch {
        rollbackFavorite();
      }
    },
    [accessToken, queryClient],
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
      if (!accessToken) {
        return;
      }

      await removeClip(accessToken, clipId);
      setContextMenu(null);
      await refreshClipQueries();
    },
    [accessToken, refreshClipQueries],
  );

  const handleDeleteAll = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    await Promise.all(clips.map((clip) => removeClip(accessToken, clip.id)));
    setIsDeleteAllOpen(false);
    await refreshClipQueries();
  }, [accessToken, clips, refreshClipQueries]);

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
