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
import type { FolderDropPosition } from "@/features/folder/model/folder";
import { FolderNameModal } from "@/features/folder/ui/FolderNameModal";
import { FolderSidebarFooter } from "@/features/folder/ui/FolderSidebarFooter";
import { FolderSidebarHeader } from "@/features/folder/ui/FolderSidebarHeader";
import { FolderSidebarSection } from "@/features/folder/ui/FolderSidebarSection";
import { SidebarPrimaryNav } from "@/features/folder/ui/SidebarPrimaryNav";

const RESERVED_PATHNAMES = new Set([
  "favorites",
  "recent",
  "trash",
  "login",
  "pricing",
]);

interface SidebarProps {
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

type FolderDropTarget = {
  targetId: string;
  position: FolderDropPosition;
  indicatorFolderId: string;
  indicatorEdge: "top" | "bottom";
};

type FolderNameModalState =
  | { mode: "create"; value: string }
  | { mode: "rename"; folderId: string; value: string };

// 앱 탐색과 폴더 생성, 이름 변경, 삭제, 순서 변경 흐름을 조합합니다.
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
    removeFolder,
    renameFolder,
    saveFolderOrder,
  } = useFolders();
  const [folderNameModal, setFolderNameModal] =
    useState<FolderNameModalState | null>(null);
  const [openOptionsFolderId, setOpenOptionsFolderId] = useState<string | null>(
    null,
  );
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [folderDropTarget, setFolderDropTarget] =
    useState<FolderDropTarget | null>(null);
  const folderNameInputRef = useRef<HTMLInputElement>(null);
  const folderNameModalMode = folderNameModal?.mode ?? null;
  const pathSegments = pathname.split("/").filter(Boolean);
  const pathnameFolderId = pathSegments[0] ?? null;
  const currentFolderId =
    pathnameFolderId && !RESERVED_PATHNAMES.has(pathnameFolderId)
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
    if (folderNameModalMode && folderNameInputRef.current) {
      folderNameInputRef.current.focus();
    }
  }, [folderNameModalMode]);

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

  const clearFolderDragState = useCallback(() => {
    setDraggingFolderId(null);
    setFolderDropTarget(null);
  }, []);

  const getFolderDropTarget = useCallback(
    (
      sourceId: string | null,
      folderId: string,
      event: React.DragEvent<HTMLLIElement>,
    ): FolderDropTarget | null => {
      if (!sourceId || sourceId === folderId) {
        return null;
      }

      const sourceIndex = folders.findIndex((folder) => folder.id === sourceId);
      const hoveredIndex = folders.findIndex(
        (folder) => folder.id === folderId,
      );

      if (sourceIndex === -1 || hoveredIndex === -1) {
        return null;
      }

      const { top, height } = event.currentTarget.getBoundingClientRect();
      const isBeforeHovered = event.clientY < top + height / 2;

      if (!isBeforeHovered) {
        if (sourceIndex === hoveredIndex + 1) {
          return null;
        }

        return {
          targetId: folderId,
          position: "after",
          indicatorFolderId: folderId,
          indicatorEdge: "bottom",
        };
      }

      const previousFolder = folders[hoveredIndex - 1] ?? null;

      if (!previousFolder) {
        if (sourceIndex === 0) {
          return null;
        }

        return {
          targetId: folderId,
          position: "before",
          indicatorFolderId: folderId,
          indicatorEdge: "top",
        };
      }

      if (previousFolder.id === sourceId || sourceIndex === hoveredIndex - 1) {
        return null;
      }

      return {
        targetId: previousFolder.id,
        position: "after",
        indicatorFolderId: previousFolder.id,
        indicatorEdge: "bottom",
      };
    },
    [folders],
  );

  const handleDropFolder = useCallback(
    (
      sourceId: string | null,
      targetId: string,
      position: FolderDropPosition,
    ) => {
      clearFolderDragState();

      if (!sourceId || sourceId === targetId || !ensureAuthenticated()) {
        return;
      }

      void saveFolderOrder(sourceId, targetId, position).catch(() => {
        // refresh from the server when the final order cannot be saved
      });
    },
    [clearFolderDragState, ensureAuthenticated, saveFolderOrder],
  );

  const closeFolderNameModal = () => setFolderNameModal(null);

  const handleSubmitFolderName = useCallback(() => {
    if (!folderNameModal) {
      return;
    }

    const trimmedName = folderNameModal.value.trim();
    if (!trimmedName) {
      return;
    }

    if (!ensureAuthenticated()) {
      return;
    }

    const request =
      folderNameModal.mode === "create"
        ? createFolder(trimmedName)
        : renameFolder(folderNameModal.folderId, trimmedName);

    void request.then(closeFolderNameModal).catch(() => {
      // keep the modal open when the request fails
    });
  }, [createFolder, ensureAuthenticated, folderNameModal, renameFolder]);

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

  const handleFolderDragStart = (
    folderId: string,
    event: React.DragEvent<HTMLButtonElement>,
  ) => {
    setDraggingFolderId(folderId);
    setFolderDropTarget(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", folderId);
  };

  const handleFolderDragOver = (
    folderId: string,
    event: React.DragEvent<HTMLLIElement>,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (!draggingFolderId || draggingFolderId === folderId) {
      setFolderDropTarget(null);
      return;
    }

    const nextDropTarget = getFolderDropTarget(
      draggingFolderId,
      folderId,
      event,
    );

    setFolderDropTarget((currentTarget) =>
      currentTarget?.targetId === nextDropTarget?.targetId &&
      currentTarget?.position === nextDropTarget?.position &&
      currentTarget?.indicatorFolderId === nextDropTarget?.indicatorFolderId &&
      currentTarget?.indicatorEdge === nextDropTarget?.indicatorEdge
        ? currentTarget
        : nextDropTarget,
    );
  };

  const handleFolderDrop = (
    folderId: string,
    event: React.DragEvent<HTMLLIElement>,
  ) => {
    event.preventDefault();
    const dropTarget = getFolderDropTarget(draggingFolderId, folderId, event);

    if (!dropTarget) {
      clearFolderDragState();
      return;
    }

    handleDropFolder(
      draggingFolderId,
      dropTarget.targetId,
      dropTarget.position,
    );
  };

  const handleToggleFolderOptions = (folderId: string) => {
    setOpenOptionsFolderId((previous) =>
      previous === folderId ? null : folderId,
    );
  };

  const handleOpenRenameFolder = (folderId: string) => {
    const targetFolder = folders.find((folder) => folder.id === folderId);
    if (!targetFolder) {
      return;
    }

    setOpenOptionsFolderId(null);
    setFolderNameModal({
      mode: "rename",
      folderId,
      value: targetFolder.name,
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    const isDeletingCurrentFolder = pathnameFolderId === folderId;
    const redirectPath = getRedirectPathAfterFolderDelete(folderId);

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
  };

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
              dropIndicator={
                folderDropTarget
                  ? {
                      folderId: folderDropTarget.indicatorFolderId,
                      edge: folderDropTarget.indicatorEdge,
                    }
                  : null
              }
              onAddFolder={() => {
                setFolderNameModal({ mode: "create", value: "" });
              }}
              onNavigate={onCloseMobile}
              onDragStart={handleFolderDragStart}
              onDragEnd={clearFolderDragState}
              onDragOver={handleFolderDragOver}
              onDrop={handleFolderDrop}
              onToggleOptions={handleToggleFolderOptions}
              onRenameFolder={handleOpenRenameFolder}
              onDeleteFolder={handleDeleteFolder}
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

      {folderNameModal ? (
        <FolderNameModal
          title={t(
            folderNameModal.mode === "create" ? "createFolder" : "renameFolder",
          )}
          closeLabel={t(
            folderNameModal.mode === "create"
              ? "closeCreateFolder"
              : "closeRenameFolder",
          )}
          fieldLabel={t("folderName")}
          placeholder={t("folderNamePlaceholder")}
          confirmLabel={t(
            folderNameModal.mode === "create" ? "create" : "change",
          )}
          cancelLabel={t("cancel")}
          value={folderNameModal.value}
          inputRef={folderNameInputRef}
          onChange={(value) =>
            setFolderNameModal((current) =>
              current ? { ...current, value } : current,
            )
          }
          onClose={closeFolderNameModal}
          onConfirm={handleSubmitFolderName}
        />
      ) : null}
    </>
  );
}
