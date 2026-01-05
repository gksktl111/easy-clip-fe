"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineDotsVertical,
  HiOutlineFolder,
  HiOutlineMenuAlt4,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineTrash,
  HiX,
} from "react-icons/hi";

interface ISidebarProps {
  onOpenSettings: () => void;
}

interface IFolderItem {
  id: string;
  name: string;
}

const FOLDER_STORAGE_KEY = "easy-clip-folders";
const EMPTY_FOLDERS: IFolderItem[] = [];

export function Sidebar({ onOpenSettings }: ISidebarProps) {
  const pathname = usePathname();
  const topNavs = [
    {
      href: "/favorites",
      label: "Favorites",
      icon: <HiOutlineStar className="h-5 w-5" aria-hidden />,
    },
    {
      href: "/recent",
      label: "Recent",
      icon: <HiOutlineClock className="h-5 w-5" aria-hidden />,
    },
  ];
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [openOptionsFolderId, setOpenOptionsFolderId] = useState<string | null>(
    null,
  );
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const lastFoldersRawRef = useRef<string | null>(null);
  const lastFoldersRef = useRef<IFolderItem[]>(EMPTY_FOLDERS);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);

  const getFoldersSnapshot = useCallback(() => {
    const stored = localStorage.getItem(FOLDER_STORAGE_KEY);
    if (stored === lastFoldersRawRef.current) {
      return lastFoldersRef.current;
    }
    if (!stored) {
      lastFoldersRawRef.current = null;
      lastFoldersRef.current = EMPTY_FOLDERS;
      return EMPTY_FOLDERS;
    }
    try {
      const parsed = JSON.parse(stored) as IFolderItem[];
      const nextFolders = Array.isArray(parsed) ? parsed : EMPTY_FOLDERS;
      lastFoldersRawRef.current = stored;
      lastFoldersRef.current = nextFolders;
      return nextFolders;
    } catch {
      lastFoldersRawRef.current = stored;
      lastFoldersRef.current = EMPTY_FOLDERS;
      return EMPTY_FOLDERS;
    }
  }, []);

  const subscribeToFolders = useCallback((callback: () => void) => {
    const handler = () => callback();
    window.addEventListener("storage", handler);
    window.addEventListener("folders:change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("folders:change", handler);
    };
  }, []);

  const folders = useSyncExternalStore(
    subscribeToFolders,
    getFoldersSnapshot,
    () => EMPTY_FOLDERS,
  );

  // 모달이 열릴 때 input에 포커스
  useEffect(() => {
    if (isCreateFolderModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreateFolderModalOpen]);

  useEffect(() => {
    if (isRenameFolderModalOpen && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [isRenameFolderModalOpen]);

  useEffect(() => {
    if (!openOptionsFolderId) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-folder-options]")) return;
      setOpenOptionsFolderId(null);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [openOptionsFolderId]);

  const persistFolders = useCallback((nextFolders: IFolderItem[]) => {
    localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(nextFolders));
    window.dispatchEvent(new Event("folders:change"));
  }, []);

  const reorderFolders = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return;
      const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
      const targetIndex = folders.findIndex((folder) => folder.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return;
      const nextFolders = [...folders];
      const [moved] = nextFolders.splice(sourceIndex, 1);
      nextFolders.splice(targetIndex, 0, moved);
      persistFolders(nextFolders);
    },
    [folders, persistFolders],
  );

  const handleDragStart = useCallback((id: string) => {
    return (event: React.DragEvent<HTMLButtonElement>) => {
      setDraggingFolderId(id);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    };
  }, []);

  const handleDragOver = useCallback(
    (id: string) => (event: React.DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (!draggingFolderId || draggingFolderId === id) return;
      reorderFolders(draggingFolderId, id);
    },
    [draggingFolderId, reorderFolders],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingFolderId(null);
  }, []);

  // 모달 열기
  const handleOpenCreateFolderModal = useCallback(() => {
    setNewFolderName("");
    setIsCreateFolderModalOpen(true);
  }, []);

  // 모달 닫기
  const handleCloseCreateFolderModal = useCallback(() => {
    setIsCreateFolderModalOpen(false);
    setNewFolderName("");
  }, []);

  const handleOpenRenameFolderModal = useCallback(
    (folderId: string, name: string) => {
      setRenameFolderId(folderId);
      setRenameFolderName(name);
      setIsRenameFolderModalOpen(true);
    },
    [],
  );

  const handleCloseRenameFolderModal = useCallback(() => {
    setIsRenameFolderModalOpen(false);
    setRenameFolderId(null);
    setRenameFolderName("");
  }, []);

  // 폴더 생성
  const handleCreateFolder = useCallback(() => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    persistFolders([...folders, { id, name: trimmedName }]);
    handleCloseCreateFolderModal();
  }, [newFolderName, folders, persistFolders, handleCloseCreateFolderModal]);

  const handleRenameFolder = useCallback(() => {
    if (!renameFolderId) return;
    const trimmedName = renameFolderName.trim();
    if (!trimmedName) return;
    const nextFolders = folders.map((folder) =>
      folder.id === renameFolderId ? { ...folder, name: trimmedName } : folder,
    );
    persistFolders(nextFolders);
    handleCloseRenameFolderModal();
  }, [
    renameFolderId,
    renameFolderName,
    folders,
    persistFolders,
    handleCloseRenameFolderModal,
  ]);

  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      const nextFolders = folders.filter((folder) => folder.id !== folderId);
      persistFolders(nextFolders);
      setOpenOptionsFolderId(null);
    },
    [folders, persistFolders],
  );

  const handleToggleFolderOptions = useCallback((folderId: string) => {
    setOpenOptionsFolderId((prev) => (prev === folderId ? null : folderId));
  }, []);

  const handleRenameFromOptions = useCallback(
    (folderId: string, name: string) => {
      setOpenOptionsFolderId(null);
      handleOpenRenameFolderModal(folderId, name);
    },
    [handleOpenRenameFolderModal],
  );

  // Enter 키로 폴더 생성
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleCreateFolder();
      } else if (event.key === "Escape") {
        handleCloseCreateFolderModal();
      }
    },
    [handleCreateFolder, handleCloseCreateFolderModal],
  );

  const handleRenameKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleRenameFolder();
      } else if (event.key === "Escape") {
        handleCloseRenameFolderModal();
      }
    },
    [handleRenameFolder, handleCloseRenameFolderModal],
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 p-5">
        <h1 className="text-xl font-semibold text-gray-900">
          Clipboard Studio
        </h1>
      </div>

      <nav className="flex-1 py-4">
        <div className="space-y-6">
          <ul className="space-y-2 px-2">
            {topNavs.map((nav) => (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                    pathname === nav.href
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {nav.icon}
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleOpenCreateFolderModal}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <HiOutlinePlus className="h-5 w-5" aria-hidden />
              Add Folder
            </button>
            <ul className="space-y-1 px-2">
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  onDragOver={handleDragOver(folder.id)}
                  className={`relative rounded-lg ${
                    draggingFolderId === folder.id ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                      pathname === `/${folder.id}`
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <button
                      type="button"
                      draggable
                      onDragStart={handleDragStart(folder.id)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab rounded p-1 text-gray-400 hover:text-gray-600"
                      aria-label="폴더 순서 변경"
                    >
                      <HiOutlineMenuAlt4 className="h-4 w-4" aria-hidden />
                    </button>
                    <Link
                      href={`/${folder.id}`}
                      className="flex flex-1 items-center gap-2 truncate"
                    >
                      <HiOutlineFolder className="h-5 w-5" aria-hidden />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleFolderOptions(folder.id)}
                      className="cursor-pointer rounded p-1 text-gray-400 transition hover:text-gray-600"
                      aria-label="폴더 옵션 열기"
                      data-folder-options
                    >
                      <HiOutlineDotsVertical className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {openOptionsFolderId === folder.id ? (
                    <div className="relative">
                      <div
                        className="absolute right-0 z-20 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                        data-folder-options
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleRenameFromOptions(folder.id, folder.name)
                          }
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <HiOutlinePencil className="h-4 w-4" aria-hidden />
                          이름 변경
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <HiOutlineTrash className="h-4 w-4" aria-hidden />
                          삭제
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div className="border-t border-gray-200 px-4 py-4">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <HiOutlineCog className="h-5 w-5" aria-hidden />
          Settings
        </button>
      </div>

      {isCreateFolderModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="flex items-center border-b border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={handleCloseCreateFolderModal}
                className="cursor-pointer rounded-full p-1 text-gray-400 transition hover:text-gray-600"
                aria-label="Close create folder"
              >
                <HiX className="h-5 w-5" aria-hidden />
              </button>
              <p className="ml-auto text-sm font-semibold text-gray-900">
                새 폴더 생성
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-gray-500">
                폴더 이름
              </label>
              <input
                ref={inputRef}
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                placeholder="예: 프로젝트"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={handleCloseCreateFolderModal}
                className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRenameFolderModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="flex items-center border-b border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={handleCloseRenameFolderModal}
                className="cursor-pointer rounded-full p-1 text-gray-400 transition hover:text-gray-600"
                aria-label="Close rename folder"
              >
                <HiX className="h-5 w-5" aria-hidden />
              </button>
              <p className="ml-auto text-sm font-semibold text-gray-900">
                폴더 이름 변경
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-gray-500">
                폴더 이름
              </label>
              <input
                ref={renameInputRef}
                value={renameFolderName}
                onChange={(event) => setRenameFolderName(event.target.value)}
                onKeyDown={handleRenameKeyDown}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                placeholder="예: 프로젝트"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={handleCloseRenameFolderModal}
                className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
