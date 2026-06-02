"use client";

import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { subscribeToClipStore } from "@/domains/clips/services/clipStoreSubscription";
import { mapStoredClipDates } from "@/domains/clips/utils/mapStoredClipDates";
import { useCopyToast } from "@/domains/clips/hooks/useCopyToast";
import {
  clearFolderClips,
  CLIP_STORAGE_KEY,
  deleteClip,
  getFolderClips,
  recordCopy,
  StoredClip,
  updateClip,
  upsertClip,
} from "@/store/clipStore";
import { FilterType } from "@/domains/clips/ui/FilterBar";
import { Clip } from "@/types/clip";

const EMPTY_CLIPS: StoredClip[] = [];

export const useFolderClipsPage = () => {
  const params = useParams<{ id?: string }>();
  const folderId = params?.id ?? "";
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameClipId, setRenameClipId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { copyToast, showCopyToast } = useCopyToast();
  const lastClipsRawRef = useRef<string | null>(null);
  const lastFolderIdRef = useRef("");
  const lastClipsRef = useRef<StoredClip[]>(EMPTY_CLIPS);

  const getClipsSnapshot = useCallback(() => {
    if (!folderId) {
      return EMPTY_CLIPS;
    }

    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (
      stored === lastClipsRawRef.current &&
      folderId === lastFolderIdRef.current
    ) {
      return lastClipsRef.current;
    }

    const nextClips = getFolderClips(folderId);
    lastClipsRawRef.current = stored;
    lastFolderIdRef.current = folderId;
    lastClipsRef.current = nextClips;
    return nextClips;
  }, [folderId]);

  const storedClips = useSyncExternalStore(
    subscribeToClipStore,
    getClipsSnapshot,
    () => EMPTY_CLIPS,
  );

  const clips = useMemo<Clip[]>(
    () => storedClips.map(mapStoredClipDates),
    [storedClips],
  );

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
    if (isRenameOpen && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [isRenameOpen]);

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

  const addClip = useCallback((clip: StoredClip) => {
    upsertClip(clip);
  }, []);

  const createTextClip = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      const now = new Date().toISOString();
      const isColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed);
      addClip({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        folderId: folderId || null,
        type: isColor ? "color" : "text",
        name: isColor ? "Color Clip" : "Text Clip",
        content: trimmed,
        createdAt: now,
        updatedAt: now,
        lastCopiedAt: now,
        isFavorite: false,
      });
    },
    [addClip, folderId],
  );

  const createImageClip = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (!result) {
          return;
        }

        const now = new Date().toISOString();
        addClip({
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}`,
          folderId: folderId || null,
          type: "image",
          name: "Image Clip",
          content: result,
          createdAt: now,
          updatedAt: now,
          lastCopiedAt: now,
          isFavorite: false,
        });
      };
      reader.readAsDataURL(file);
    },
    [addClip, folderId],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isActive || !folderId) {
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
          createImageClip(file);
          return;
        }
      }

      const text = clipboard.getData("text");
      if (text) {
        createTextClip(text);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [createImageClip, createTextClip, folderId, isActive]);

  const handleCopy = useCallback(
    async (clip: Clip, event: React.MouseEvent<HTMLDivElement>) => {
      showCopyToast(event.clientX, event.clientY);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }

      recordCopy(clip.id);
    },
    [showCopyToast],
  );

  const handleCopyFromMenu = useCallback(async (clip: Clip) => {
    try {
      await navigator.clipboard.writeText(clip.content);
    } catch {
      // no-op
    }

    recordCopy(clip.id);
    setContextMenu(null);
  }, []);

  const handleToggleFavorite = useCallback((clip: Clip) => {
    updateClip(clip.id, {
      isFavorite: !clip.isFavorite,
      updatedAt: new Date().toISOString(),
    });
  }, []);

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

  const handleDeleteClip = useCallback((clipId: string) => {
    deleteClip(clipId);
    setContextMenu(null);
  }, []);

  const handleOpenRename = useCallback((clipId: string, name: string) => {
    setContextMenu(null);
    setRenameClipId(clipId);
    setRenameName(name);
    setIsRenameOpen(true);
  }, []);

  const handleRenameClip = useCallback(() => {
    if (!renameClipId) {
      return;
    }

    const trimmed = renameName.trim();
    if (!trimmed) {
      return;
    }

    updateClip(renameClipId, {
      name: trimmed,
      updatedAt: new Date().toISOString(),
    });
    setIsRenameOpen(false);
    setRenameClipId(null);
    setRenameName("");
  }, [renameClipId, renameName]);

  const handleDeleteAll = useCallback(() => {
    if (folderId) {
      clearFolderClips(folderId);
    }
    setIsDeleteAllOpen(false);
  }, [folderId]);

  return {
    activeFilter,
    clips,
    contextMenu,
    copyToast,
    filteredClips,
    hasClips: storedClips.length > 0,
    isActive,
    isDeleteAllOpen,
    isRenameOpen,
    renameInputRef,
    renameName,
    searchQuery,
    setActiveFilter,
    setContextMenu,
    setIsActive,
    setIsDeleteAllOpen,
    setIsRenameOpen,
    setRenameName,
    setSearchQuery,
    handleCopy,
    handleCopyFromMenu,
    handleDeleteAll,
    handleDeleteClip,
    handleOpenContextMenu,
    handleOpenRename,
    handleRenameClip,
    handleToggleFavorite,
  };
};
