"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineClock, HiOutlineStar, HiOutlineTrash } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/features/auth/api/authApi";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { clearAuthSession } from "@/features/auth/service/authSession";
import { invalidateClipQueries } from "@/features/clip/service/clipQueryCache";
import { useFolders } from "@/features/folder/hooks/useFolders";
import { FolderNameModal } from "@/features/folder/ui/FolderNameModal";
import { FolderSidebarFooter } from "@/features/folder/ui/FolderSidebarFooter";
import { FolderSidebarHeader } from "@/features/folder/ui/FolderSidebarHeader";
import { FolderSidebarSection } from "@/features/folder/ui/FolderSidebarSection";
import { SidebarPrimaryNav } from "@/features/folder/ui/SidebarPrimaryNav";

//TODO : 클립 도메인으로 합병

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useAuthSession();
  const isAuthenticated = Boolean(session?.user);
  const {
    createFolder,
    folders,
    isLoading: isFoldersLoading,
    previewFolderOrder,
    removeFolder,
    renameFolder,
    saveFolderOrder,
  } = useFolders();
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
  const hasPendingFolderReorderRef = useRef(false);
  const lastReorderTargetIdRef = useRef<string | null>(null);
  const pathSegments = pathname.split("/").filter(Boolean);
  const pathnameFolderId = pathSegments[0] ?? null;
  const reservedPathnames = new Set([
    "favorites",
    "recent",
    "trash",
    "login",
    "pricing",
  ]);
  const currentFolderId =
    pathnameFolderId && !reservedPathnames.has(pathnameFolderId)
      ? pathnameFolderId
      : (folders[0]?.id ?? null);

  const topNavs = [
    {
      href: currentFolderId ? `/${currentFolderId}/favorites` : "/favorites",
      label: t("favorites"),
      icon: <HiOutlineStar className="h-5 w-5" aria-hidden />,
    },
    {
      href: currentFolderId ? `/${currentFolderId}/recent` : "/recent",
      label: t("recent"),
      icon: <HiOutlineClock className="h-5 w-5" aria-hidden />,
    },
    {
      href: "/trash",
      label: t("trash"),
      icon: <HiOutlineTrash className="h-5 w-5" aria-hidden />,
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

  const ensureAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }

    onCloseMobile?.();
    router.push("/login");
    return false;
  }, [isAuthenticated, onCloseMobile, router]);

  const handleReorderFolders = useCallback(
    (sourceId: string, targetId: string) => {
      if (!ensureAuthenticated()) {
        return;
      }

      if (sourceId === targetId) {
        return;
      }

      if (lastReorderTargetIdRef.current === targetId) {
        return;
      }

      const didReorder = previewFolderOrder(sourceId, targetId);

      if (didReorder) {
        hasPendingFolderReorderRef.current = true;
        lastReorderTargetIdRef.current = targetId;
      }
    },
    [ensureAuthenticated, previewFolderOrder],
  );

  const handleCommitFolderReorder = useCallback(
    (folderId: string | null) => {
      setDraggingFolderId(null);
      lastReorderTargetIdRef.current = null;

      if (!folderId || !hasPendingFolderReorderRef.current) {
        return;
      }

      hasPendingFolderReorderRef.current = false;

      void saveFolderOrder(folderId).catch(() => {
        // refresh from the server when the final order cannot be saved
      });
    },
    [saveFolderOrder],
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

    if (!ensureAuthenticated()) {
      return;
    }

    void createFolder(trimmedName)
      .then(() => closeCreateModal())
      .catch(() => {
        // keep the modal open when the request fails
      });
  }, [createFolder, ensureAuthenticated, newFolderName]);

  const handleRenameFolder = useCallback(() => {
    if (!renameFolderId) {
      return;
    }

    const trimmedName = renameFolderName.trim();
    if (!trimmedName) {
      return;
    }

    if (!ensureAuthenticated()) {
      return;
    }

    void renameFolder(renameFolderId, trimmedName)
      .then(() => closeRenameModal())
      .catch(() => {
        // keep the modal open when the request fails
      });
  }, [ensureAuthenticated, renameFolder, renameFolderId, renameFolderName]);

  const getRedirectPathAfterFolderDelete = useCallback(
    (deletedFolderId: string) => {
      const deletedFolderIndex = folders.findIndex(
        (folder) => folder.id === deletedFolderId,
      );
      const remainingFolders = folders.filter(
        (folder) => folder.id !== deletedFolderId,
      );
      const nextFolder =
        remainingFolders[
          Math.min(Math.max(deletedFolderIndex, 0), remainingFolders.length - 1)
        ] ?? null;
      const [, section] = pathname.split("/").filter(Boolean);

      if (section === "favorites") {
        return nextFolder ? `/${nextFolder.id}/favorites` : "/favorites";
      }

      if (section === "recent") {
        return nextFolder ? `/${nextFolder.id}/recent` : "/recent";
      }

      return nextFolder ? `/${nextFolder.id}` : "/recent";
    },
    [folders, pathname],
  );

  const userLabel =
    session?.user?.authAccounts?.[0]?.email ??
    session?.user?.displayName ??
    t("guest");

  const handleLogout = useCallback(async () => {
    onCloseMobile?.();

    try {
      if (isAuthenticated) {
        await logout();
      }
    } catch {
      // clear client session even when the server session is already invalid
    } finally {
      clearAuthSession();
      queryClient.clear();
      router.push("/login");
      router.refresh();
    }
  }, [isAuthenticated, onCloseMobile, queryClient, router]);

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 cursor-pointer bg-(--overlay) md:hidden"
          aria-label="사이드바 닫기"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 max-w-[86vw] flex-col border-r border-(--border) bg-(--surface-muted) transition-transform duration-300 md:static md:z-auto md:w-64 md:max-w-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <FolderSidebarHeader onCloseMobile={onCloseMobile} />

        <nav className="flex-1 py-4">
          <div className="space-y-6">
            <SidebarPrimaryNav
              items={topNavs}
              pathname={pathname}
              onNavigate={onCloseMobile}
            />

            <FolderSidebarSection
              folders={folders}
              isLoading={isFoldersLoading}
              pathname={pathname}
              addFolderLabel={t("addFolder")}
              reorderFolderLabel={t("reorderFolder")}
              openFolderOptionsLabel={t("openFolderOptions")}
              renameLabel={t("rename")}
              deleteLabel={t("delete")}
              openOptionsFolderId={openOptionsFolderId}
              draggingFolderId={draggingFolderId}
              onAddFolder={() => {
                setNewFolderName("");
                setIsCreateFolderModalOpen(true);
              }}
              onNavigate={onCloseMobile}
              onDragStart={(folderId, event) => {
                setDraggingFolderId(folderId);
                hasPendingFolderReorderRef.current = false;
                lastReorderTargetIdRef.current = null;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", folderId);
              }}
              onDragEnd={() => handleCommitFolderReorder(draggingFolderId)}
              onDragOver={(folderId, event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (!draggingFolderId || draggingFolderId === folderId) {
                  return;
                }

                handleReorderFolders(draggingFolderId, folderId);
              }}
              onToggleOptions={(folderId) =>
                setOpenOptionsFolderId((previous) =>
                  previous === folderId ? null : folderId,
                )
              }
              onRenameFolder={(folderId) => {
                const targetFolder = folders.find(
                  (folder) => folder.id === folderId,
                );
                if (!targetFolder) {
                  return;
                }

                setOpenOptionsFolderId(null);
                setRenameFolderId(folderId);
                setRenameFolderName(targetFolder.name);
                setIsRenameFolderModalOpen(true);
              }}
              onDeleteFolder={(folderId) => {
                if (!ensureAuthenticated()) {
                  return;
                }

                const isDeletingCurrentFolder = pathnameFolderId === folderId;
                const redirectPath =
                  getRedirectPathAfterFolderDelete(folderId);

                void removeFolder(folderId)
                  .then(() => {
                    setOpenOptionsFolderId(null);
                    void invalidateClipQueries(queryClient);

                    if (isDeletingCurrentFolder) {
                      onCloseMobile?.();
                      router.replace(redirectPath);
                    }
                  })
                  .catch(() => {
                    // keep the menu open when the request fails
                  });
              }}
            />
          </div>
        </nav>

        <FolderSidebarFooter
          userLabel={userLabel}
          settingsLabel={t("settings")}
          logoutLabel={t("logout")}
          upgradePlanLabel={t("upgradePlan")}
          onOpenSettings={() => {
            onCloseMobile?.();
            onOpenSettings();
          }}
          onUpgradePlan={() => {
            onCloseMobile?.();
            router.push("/pricing");
          }}
          onLogout={handleLogout}
        />
      </aside>

      {isCreateFolderModalOpen ? (
        <FolderNameModal
          title={t("createFolder")}
          closeLabel={t("closeCreateFolder")}
          fieldLabel={t("folderName")}
          placeholder={t("folderNamePlaceholder")}
          confirmLabel={t("create")}
          cancelLabel={t("cancel")}
          value={newFolderName}
          inputRef={inputRef}
          onChange={setNewFolderName}
          onClose={closeCreateModal}
          onConfirm={handleCreateFolder}
        />
      ) : null}

      {isRenameFolderModalOpen ? (
        <FolderNameModal
          title={t("renameFolder")}
          closeLabel={t("closeRenameFolder")}
          fieldLabel={t("folderName")}
          placeholder={t("folderNamePlaceholder")}
          confirmLabel={t("change")}
          cancelLabel={t("cancel")}
          value={renameFolderName}
          inputRef={renameInputRef}
          onChange={setRenameFolderName}
          onClose={closeRenameModal}
          onConfirm={handleRenameFolder}
        />
      ) : null}
    </>
  );
}
