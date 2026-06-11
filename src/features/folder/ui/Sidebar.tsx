"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineDotsVertical,
  HiOutlineFolder,
  HiOutlineLogout,
  HiOutlineMenuAlt4,
  HiOutlinePaperClip,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineTrash,
  HiX,
} from "react-icons/hi";
import { useFolders } from "@/features/folder/hooks/useFolders";

interface SidebarProps {
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { folders, persistFolders } = useFolders();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [openOptionsFolderId, setOpenOptionsFolderId] = useState<string | null>(
    null,
  );
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const topNavs = [
    {
      href: "/favorites",
      label: t("favorites"),
      icon: <HiOutlineStar className="h-5 w-5" aria-hidden />,
    },
    {
      href: "/recent",
      label: t("recent"),
      icon: <HiOutlineClock className="h-5 w-5" aria-hidden />,
    },
  ];

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
    if (!openOptionsFolderId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-folder-options]")) {
        return;
      }

      setOpenOptionsFolderId(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [openOptionsFolderId]);

  useEffect(() => {
    onCloseMobile?.();
  }, [onCloseMobile, pathname]);

  const reorderFolders = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        return;
      }

      const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
      const targetIndex = folders.findIndex((folder) => folder.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) {
        return;
      }

      const nextFolders = [...folders];
      const [moved] = nextFolders.splice(sourceIndex, 1);
      nextFolders.splice(targetIndex, 0, moved);
      persistFolders(nextFolders);
    },
    [folders, persistFolders],
  );

  const closeCreateModal = () => {
    setIsCreateFolderModalOpen(false);
    setNewFolderName("");
  };

  const closeRenameModal = () => {
    setIsRenameFolderModalOpen(false);
    setRenameFolderId(null);
    setRenameFolderName("");
  };

  const handleCreateFolder = useCallback(() => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      return;
    }

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;

    persistFolders([...folders, { id, name: trimmedName }]);
    closeCreateModal();
  }, [folders, newFolderName, persistFolders]);

  const handleRenameFolder = useCallback(() => {
    if (!renameFolderId) {
      return;
    }

    const trimmedName = renameFolderName.trim();
    if (!trimmedName) {
      return;
    }

    const nextFolders = folders.map((folder) =>
      folder.id === renameFolderId ? { ...folder, name: trimmedName } : folder,
    );

    persistFolders(nextFolders);
    closeRenameModal();
  }, [folders, persistFolders, renameFolderId, renameFolderName]);

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-(--overlay) md:hidden"
          aria-label="사이드바 닫기"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 max-w-[86vw] flex-col border-r border-(--border) bg-(--surface-muted) transition-transform duration-300 md:static md:z-auto md:w-64 md:max-w-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="border-b border-(--border) px-4 py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HiOutlinePaperClip className="h-5 w-5" aria-hidden />
              <h1 className="text-foreground text-xl font-semibold">
                Easy Clip
              </h1>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-full text-(--muted) transition hover:bg-(--surface) hover:text-(--foreground) md:hidden"
              aria-label="사이드바 닫기"
            >
              <HiX className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <div className="space-y-6">
            <ul className="space-y-2 px-2">
              {topNavs.map((nav) => (
                <li key={nav.href}>
                  <Link
                    href={nav.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                      pathname === nav.href
                        ? "text-foreground bg-(--surface)"
                        : "text-muted hover:text-foreground hover:bg-(--surface)"
                    }`}
                  >
                    {nav.icon}
                    {nav.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-(--border) pt-4">
              <button
                type="button"
                onClick={() => {
                  setNewFolderName("");
                  setIsCreateFolderModalOpen(true);
                }}
                className="hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-(--muted) transition-colors hover:bg-(--surface)"
              >
                <HiOutlinePlus className="h-5 w-5" aria-hidden />
                {t("addFolder")}
              </button>
              <ul className="space-y-1 px-2">
                {folders.map((folder) => (
                  <li
                    key={folder.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      if (!draggingFolderId || draggingFolderId === folder.id) {
                        return;
                      }
                      reorderFolders(draggingFolderId, folder.id);
                    }}
                    className={`relative rounded-lg ${
                      draggingFolderId === folder.id ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                        pathname === `/${folder.id}`
                          ? "text-foreground bg-(--surface)"
                          : "text-muted hover:text-foreground hover:bg-(--surface)"
                      }`}
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          setDraggingFolderId(folder.id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", folder.id);
                        }}
                        onDragEnd={() => setDraggingFolderId(null)}
                        className="text-muted hover:text-foreground cursor-grab rounded p-1"
                        aria-label={t("reorderFolder")}
                      >
                        <HiOutlineMenuAlt4 className="h-4 w-4" aria-hidden />
                      </button>
                      <Link
                        href={`/${folder.id}`}
                        onClick={onCloseMobile}
                        className="flex flex-1 items-center gap-2 truncate"
                      >
                        <HiOutlineFolder className="h-5 w-5" aria-hidden />
                        <span className="truncate">{folder.name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenOptionsFolderId((previous) =>
                            previous === folder.id ? null : folder.id,
                          )
                        }
                        className="text-muted hover:text-foreground cursor-pointer rounded p-1 transition"
                        aria-label={t("openFolderOptions")}
                        data-folder-options
                      >
                        <HiOutlineDotsVertical
                          className="h-4 w-4"
                          aria-hidden
                        />
                      </button>
                    </div>
                    {openOptionsFolderId === folder.id ? (
                      <div className="relative">
                        <div
                          className="absolute right-0 z-20 w-32 overflow-hidden rounded-lg border border-(--border) bg-(--surface) shadow-lg"
                          data-folder-options
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenOptionsFolderId(null);
                              setRenameFolderId(folder.id);
                              setRenameFolderName(folder.name);
                              setIsRenameFolderModalOpen(true);
                            }}
                            className="text-foreground flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-(--surface-muted)"
                          >
                            <HiOutlinePencil className="h-4 w-4" aria-hidden />
                            {t("rename")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              persistFolders(
                                folders.filter(
                                  (currentFolder) =>
                                    currentFolder.id !== folder.id,
                                ),
                              );
                              setOpenOptionsFolderId(null);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-(--danger) hover:bg-(--surface-muted)"
                          >
                            <HiOutlineTrash className="h-4 w-4" aria-hidden />
                            {t("delete")}
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

        <div className="border-t border-(--border) px-4 py-4">
          <div className="mb-3 flex items-center justify-between rounded-lg bg-(--surface) px-3 py-2">
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-(--icon-chip) text-[10px] font-semibold text-(--icon-chip-text)">
                EC
              </div>
              <span className="text-foreground truncate text-sm font-medium">
                user@example.com
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onCloseMobile?.();
                window.location.href = "/login";
              }}
              className="text-muted hover:text-foreground cursor-pointer rounded p-1 transition-colors"
              aria-label={t("logout")}
            >
              <HiOutlineLogout className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onCloseMobile?.();
              onOpenSettings();
            }}
            className="hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) transition-colors hover:bg-(--surface)"
          >
            <HiOutlineCog className="h-5 w-5" aria-hidden />
            {t("settings")}
          </button>
        </div>

      </aside>

      {isCreateFolderModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
          <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
            <div className="flex items-center border-b border-(--border) px-5 py-4">
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-muted hover:text-foreground cursor-pointer rounded-full p-1 transition"
                aria-label={t("closeCreateFolder")}
              >
                <HiX className="h-5 w-5" aria-hidden />
              </button>
              <p className="text-foreground ml-auto text-sm font-semibold">
                {t("createFolder")}
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="text-muted block text-xs font-semibold">
                {t("folderName")}
              </label>
              <input
                ref={inputRef}
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCreateFolder();
                  } else if (event.key === "Escape") {
                    closeCreateModal();
                  }
                }}
                className="text-foreground mt-2 w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:outline-none"
                placeholder={t("folderNamePlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
              <button
                type="button"
                onClick={closeCreateModal}
                className="hover:text-foreground cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="text-primary-foreground cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium transition hover:bg-(--primary-hover)"
              >
                {t("create")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRenameFolderModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay) px-4">
          <div className="w-full max-w-sm rounded-xl bg-(--surface-elevated) shadow-xl">
            <div className="flex items-center border-b border-(--border) px-5 py-4">
              <button
                type="button"
                onClick={closeRenameModal}
                className="hover:text-foreground cursor-pointer rounded-full p-1 text-(--muted) transition"
                aria-label={t("closeRenameFolder")}
              >
                <HiX className="h-5 w-5" aria-hidden />
              </button>
              <p className="text-foreground ml-auto text-sm font-semibold">
                {t("renameFolder")}
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-(--muted)">
                {t("folderName")}
              </label>
              <input
                ref={renameInputRef}
                value={renameFolderName}
                onChange={(event) => setRenameFolderName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleRenameFolder();
                  } else if (event.key === "Escape") {
                    closeRenameModal();
                  }
                }}
                className="text-foreground mt-2 w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-sm placeholder:text-(--muted) focus:border-(--focus-ring) focus:outline-none"
                placeholder={t("folderNamePlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-(--border) px-5 py-4">
              <button
                type="button"
                onClick={closeRenameModal}
                className="hover:text-foreground cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--muted) transition"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                className="text-primary-foreground cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium transition hover:bg-(--primary-hover)"
              >
                {t("change")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
