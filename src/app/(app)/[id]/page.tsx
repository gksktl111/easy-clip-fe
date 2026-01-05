"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useParams } from "next/navigation";
import { ClipList } from "../../../components/clips/ClipList";
import { DeleteAllButton } from "../../../components/clips/DeleteAllButton";
import { EmptyState } from "../../../components/clips/EmptyState";
import { FilterBar, FilterType } from "../../../components/clips/FilterBar";
import {
  clearFolderClips,
  CLIP_EVENT,
  CLIP_STORAGE_KEY,
  deleteClip,
  getFolderClips,
  recordCopy,
  StoredClip,
  updateClip,
  upsertClip,
} from "../../../lib/clipStore";
import { Clip } from "../../../types/clip";
const EMPTY_CLIPS: StoredClip[] = [];

export default function FolderPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [copyToast, setCopyToast] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const copyToastTimerRef = useRef<number | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const lastClipsRawRef = useRef<string | null>(null);
  const lastFolderIdRef = useRef<string>("");
  const lastClipsRef = useRef<StoredClip[]>(EMPTY_CLIPS);

  const params = useParams<{ id?: string }>();
  const folderId = params?.id ?? "";

  const getClipsSnapshot = useCallback(() => {
    if (!folderId) return EMPTY_CLIPS;
    const stored = localStorage.getItem(CLIP_STORAGE_KEY);
    if (stored === lastClipsRawRef.current && folderId === lastFolderIdRef.current) {
      return lastClipsRef.current;
    }
    const nextClips = getFolderClips(folderId);
    lastClipsRawRef.current = stored;
    lastFolderIdRef.current = folderId;
    lastClipsRef.current = nextClips;
    return nextClips;
  }, [folderId]);

  const subscribeToClips = useCallback((callback: () => void) => {
    const handler = () => callback();
    window.addEventListener("storage", handler);
    window.addEventListener(CLIP_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CLIP_EVENT, handler);
    };
  }, []);

  const storedClips = useSyncExternalStore(
    subscribeToClips,
    getClipsSnapshot,
    () => EMPTY_CLIPS,
  );

  const clips = useMemo<Clip[]>(
    () =>
      storedClips.map((clip) => ({
        ...clip,
        createdAt: new Date(clip.createdAt),
        updatedAt: clip.updatedAt ? new Date(clip.updatedAt) : undefined,
        lastCopiedAt: clip.lastCopiedAt ? new Date(clip.lastCopiedAt) : null,
      })),
    [storedClips],
  );

  const filteredClips = useMemo(() => {
    const byType =
      activeFilter === "all"
        ? clips
        : clips.filter((clip) => clip.type === activeFilter);
    if (!searchQuery.trim()) return byType;
    const lowered = searchQuery.toLowerCase();
    return byType.filter((clip) => clip.name.toLowerCase().includes(lowered));
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
    if (!contextMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-clip-menu]")) return;
      setContextMenu(null);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [contextMenu]);

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
    };
  }, []);

  const addClip = useCallback(
    (clip: StoredClip) => {
      upsertClip(clip);
    },
    [],
  );

  const createTextClip = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const isColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed);
      const now = new Date().toISOString();
      const nextClip: StoredClip = {
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
      };
      addClip(nextClip);
    },
    [addClip, folderId],
  );

  const createImageClip = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (!result) return;
        const now = new Date().toISOString();
        const nextClip: StoredClip = {
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
        };
        addClip(nextClip);
      };
      reader.readAsDataURL(file);
    },
    [addClip, folderId],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isActive || !folderId) return;
      const clipboard = event.clipboardData;
      if (!clipboard) return;
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
      const { clientX, clientY } = event;
      setCopyToast({ x: clientX, y: clientY });
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
      copyToastTimerRef.current = window.setTimeout(() => {
        setCopyToast(null);
      }, 3000);

      try {
        await navigator.clipboard.writeText(clip.content);
      } catch {
        // no-op
      }
      recordCopy(clip.id);
    },
    [],
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

  const handleToggleFavorite = useCallback(
    (clip: Clip) => {
      updateClip(clip.id, {
        isFavorite: !clip.isFavorite,
        updatedAt: new Date().toISOString(),
      });
    },
    [],
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
    (clipId: string) => {
      deleteClip(clipId);
      setContextMenu(null);
    },
    [],
  );

  const handleOpenRename = useCallback(
    (clipId: string, name: string) => {
      setContextMenu(null);
      setRenameFolderId(clipId);
      setRenameName(name);
      setIsRenameOpen(true);
    },
    [],
  );

  const handleRenameClip = useCallback(() => {
    if (!renameFolderId) return;
    const trimmed = renameName.trim();
    if (!trimmed) return;
    updateClip(renameFolderId, {
      name: trimmed,
      updatedAt: new Date().toISOString(),
    });
    setIsRenameOpen(false);
    setRenameFolderId(null);
    setRenameName("");
  }, [renameFolderId, renameName]);

  const handleDeleteAll = useCallback(() => {
    if (folderId) {
      clearFolderClips(folderId);
    }
    setIsDeleteAllOpen(false);
  }, [folderId]);

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-white"
      onClick={() => {
        setIsActive(true);
        setContextMenu(null);
      }}
    >
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isActive={isActive}
        countLabel={`${filteredClips.length} clips`}
      />
      {!isActive ? (
        <div className="px-6 pt-4">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-500">
            Click anywhere and press Ctrl+V to capture a new clip
          </div>
        </div>
      ) : null}
      {filteredClips.length ? (
        <ClipList
          clips={filteredClips}
          onCopy={handleCopy}
          onToggleFavorite={handleToggleFavorite}
          onContextMenu={handleOpenContextMenu}
        />
      ) : (
        <EmptyState />
      )}
      <DeleteAllButton
        disabled={storedClips.length === 0}
        onClick={() => setIsDeleteAllOpen(true)}
      />

      {contextMenu ? (
        <div
          className="fixed z-50 w-36 rounded-lg border border-gray-200 bg-white p-1 text-xs text-gray-600 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          data-clip-menu
        >
          <button
            type="button"
            onClick={() => {
              const target = clips.find((clip) => clip.id === contextMenu.id);
              if (target) {
                handleCopyFromMenu(target);
              }
            }}
            className="flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            data-clip-menu
          >
            복사
          </button>
          <button
            type="button"
            onClick={() => {
              const target = clips.find((clip) => clip.id === contextMenu.id);
              if (target) {
                handleOpenRename(target.id, target.name);
              }
            }}
            className="flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            data-clip-menu
          >
            이름 변경
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClip(contextMenu.id)}
            className="flex w-full items-center justify-start rounded px-2 py-1.5 text-left text-red-500 hover:bg-red-50"
            data-clip-menu
          >
            삭제
          </button>
        </div>
      ) : null}

      {copyToast ? (
        <div
          className="fixed z-50 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md"
          style={{ left: copyToast.x + 12, top: copyToast.y + 12 }}
        >
          COPY!
        </div>
      ) : null}

      {isDeleteAllOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">
                모든 클립 삭제
              </p>
              <p className="mt-1 text-xs text-gray-500">
                정말 모든 클립을 삭제하시겠습니까?
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRenameOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">이름 변경</p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-gray-500">
                클립 이름
              </label>
              <input
                ref={renameInputRef}
                value={renameName}
                onChange={(event) => setRenameName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                placeholder="예: 클립"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsRenameOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRenameClip}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
