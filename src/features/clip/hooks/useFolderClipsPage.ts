"use client";

import { useParams, useRouter } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  createImageClip,
  createTextClip,
  fetchClips,
  likeClip,
  recordClipView,
  removeClip,
  unlikeClip,
} from "@/features/clip/api/clipApi";
import { useCopyToast } from "@/features/clip/hooks/useCopyToast";
import { Clip } from "@/features/clip/model/clip";
import { mapClipResponse } from "@/features/clip/service/mapClipResponse";
import { FilterType } from "@/features/clip/ui/FilterBar";

export const useFolderClipsPage = () => {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const folderId = params?.id ?? "";
  const session = useAuthSession();
  const accessToken = session?.accessToken ?? null;
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const { copyToast, showCopyToast } = useCopyToast();
  const requestSerialRef = useRef(0);

  const loadFolderClips = useCallback(async () => {
    if (!accessToken || !folderId) {
      startTransition(() => {
        setClips([]);
      });
      return;
    }

    const requestId = requestSerialRef.current + 1;
    requestSerialRef.current = requestId;

    const response = await fetchClips(accessToken, {
      folderId,
    });

    if (requestId !== requestSerialRef.current) {
      return;
    }

    startTransition(() => {
      setClips(response.map(mapClipResponse));
    });
  }, [accessToken, folderId]);

  useEffect(() => {
    void loadFolderClips();
  }, [loadFolderClips]);

  const filteredClips = useMemo(() => {
    const clipsByType =
      activeFilter === "all"
        ? clips
        : clips.filter((clip) => clip.type === activeFilter);

    if (!searchQuery.trim()) {
      return clipsByType;
    }

    const loweredQuery = searchQuery.toLowerCase();
    return clipsByType.filter((clip) =>
      clip.name.toLowerCase().includes(loweredQuery),
    );
  }, [activeFilter, clips, searchQuery]);

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
      await loadFolderClips();
    },
    [accessToken, folderId, loadFolderClips],
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
      await loadFolderClips();
    },
    [accessToken, folderId, loadFolderClips],
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

      if (clip.isFavorite) {
        await unlikeClip(accessToken, clip.id);
      } else {
        await likeClip(accessToken, clip.id);
      }

      await loadFolderClips();
    },
    [accessToken, loadFolderClips],
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
      await loadFolderClips();
    },
    [accessToken, loadFolderClips],
  );

  const handleDeleteAll = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    await Promise.all(clips.map((clip) => removeClip(accessToken, clip.id)));
    setIsDeleteAllOpen(false);
    await loadFolderClips();
  }, [accessToken, clips, loadFolderClips]);

  return {
    activeFilter,
    clips,
    contextMenu,
    copyToast,
    filteredClips,
    hasClips: clips.length > 0,
    isActive,
    isDeleteAllOpen,
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
