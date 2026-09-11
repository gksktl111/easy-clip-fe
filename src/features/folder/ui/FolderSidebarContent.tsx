"use client";

import Link from "next/link";
import { HiX } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";
import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { ApiError } from "@/shared/lib/apiClient";
import { ConfirmActionModal } from "@/shared/ui/overlay/ConfirmActionModal";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useFolderActions } from "@/features/folder/mutations/useFolderActions";
import type {
  FolderDropPosition,
  FolderItem,
} from "@/features/folder/model/folder";
import {
  getFolderDropTarget,
  type FolderDropTarget,
} from "@/features/folder/service/folderDropTarget";
import { getFolderKeyboardMoveTarget } from "@/features/folder/service/folderCollection";
import { getFolderPath } from "@/features/folder/service/folderRoute";
import { FolderNameModal } from "@/features/folder/ui/FolderNameModal";
import { FolderSidebarSection } from "@/features/folder/ui/FolderSidebarSection";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { useContextMenu } from "@/shared/hooks/useContextMenu";

interface FolderSidebarContentProps {
  activeFolderId: string | null;
  folders: FolderItem[];
  isError?: boolean;
  isLoading?: boolean;
  isRetrying?: boolean;
  pathname: string;
  onNavigate?: () => void;
  onRetry?: () => void;
  onFolderDeleted: (redirectPath: string | null) => void;
}

type FolderNameModalState =
  | { mode: "create"; value: string }
  | { mode: "rename"; folderId: string; value: string };

const FOLDER_OPTIONS_MENU_WIDTH = 192;

// 폴더 생성, 이름 변경, 삭제와 정렬 상호작용만 관리합니다.
export function FolderSidebarContent({
  activeFolderId,
  folders,
  isError = false,
  isLoading = false,
  isRetrying = false,
  pathname,
  onNavigate,
  onRetry,
  onFolderDeleted,
}: FolderSidebarContentProps) {
  const feedback = useTranslations("feedback");
  const t = useTranslations("sidebar");
  const a = useTranslations("access");
  const access = useResourceAccess();
  const [showCreateLimit, setShowCreateLimit] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const {
    createFolder,
    isCreatingFolder,
    isRemovingFolder,
    isRenamingFolder,
    isReorderingFolder,
    removeFolder,
    renameFolder,
    saveFolderOrder,
  } = useFolderActions();
  const [folderNameModal, setFolderNameModal] =
    useState<FolderNameModalState | null>(null);
  const folderOptionsMenu = useContextMenu<string>({
    dataAttribute: "data-folder-options",
  });
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [folderDropTarget, setFolderDropTarget] =
    useState<FolderDropTarget | null>(null);
  const folderNameInputRef = useRef<HTMLInputElement>(null);
  const folderNameModalMode = folderNameModal?.mode ?? null;
  const isFolderNameSubmitting =
    folderNameModal?.mode === "create"
      ? isCreatingFolder
      : folderNameModal?.mode === "rename"
        ? isRenamingFolder
        : false;

  useEffect(() => {
    if (folderNameModalMode && folderNameInputRef.current) {
      folderNameInputRef.current.focus();
    }
  }, [folderNameModalMode]);

  const clearFolderDragState = () => {
    setDraggingFolderId(null);
    setFolderDropTarget(null);
  };

  const handleDropFolder = (
    sourceId: string | null,
    targetId: string,
    position: FolderDropPosition,
  ) => {
    clearFolderDragState();

    if (
      !access.isPro ||
      isReorderingFolder ||
      !sourceId ||
      sourceId === targetId
    ) {
      return;
    }

    void saveFolderOrder(sourceId, targetId, position)
      .then((changed) => {
        if (changed) notifySuccess(t("folderOrderChanged"));
      })
      .catch(() => {
        notifyError(t("folderActionError"));
      });
  };

  const closeFolderNameModal = () => setFolderNameModal(null);

  const handleSubmitFolderName = () => {
    if (!folderNameModal || isFolderNameSubmitting) {
      return;
    }

    const trimmedName = folderNameModal.value.trim();
    if (!trimmedName) {
      return;
    }

    const request =
      folderNameModal.mode === "create"
        ? createFolder(trimmedName)
        : renameFolder(folderNameModal.folderId, trimmedName);

    void request
      .then(() => {
        notifySuccess(
          feedback(
            folderNameModal.mode === "create"
              ? "folderCreated"
              : "folderRenamed",
          ),
        );
        closeFolderNameModal();
      })
      .catch((error) => {
        notifyError(
          error instanceof ApiError ? error.message : t("folderActionError"),
        );
      });
  };

  const getRedirectPathAfterFolderDelete = (deletedFolderId: string) => {
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
    return nextFolder ? getFolderPath(nextFolder.id) : "/recent";
  };

  const handleFolderDragStart = (
    folderId: string,
    event: React.DragEvent<HTMLButtonElement>,
  ) => {
    if (!access.isPro || isReorderingFolder) {
      event.preventDefault();
      return;
    }

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
      folders,
      draggingFolderId,
      folderId,
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
    const dropTarget = getFolderDropTarget(folders, draggingFolderId, folderId);

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

  const handleMoveFolder = (folderId: string, direction: "up" | "down") => {
    if (!access.isPro || isReorderingFolder) {
      return;
    }

    const moveTarget = getFolderKeyboardMoveTarget(
      folders,
      folderId,
      direction,
    );
    const sourceFolder = folders.find((folder) => folder.id === folderId);

    if (!moveTarget || !sourceFolder) {
      return;
    }

    // 버튼 메뉴와 우클릭 메뉴 모두 같은 순서 저장 경로를 타도록 여기서만 메뉴를 닫고 저장합니다.
    folderOptionsMenu.closeMenu();
    void saveFolderOrder(folderId, moveTarget.targetId, moveTarget.position)
      .then((changed) => {
        if (!changed) return;
        notifySuccess(
          t(direction === "up" ? "folderMovedUp" : "folderMovedDown", {
            name: sourceFolder.name,
          }),
        );
      })
      .catch(() => {
        notifyError(t("folderActionError"));
      });
  };

  const handleToggleFolderOptions = (
    folderId: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const { bottom, right } = event.currentTarget.getBoundingClientRect();

    folderOptionsMenu.toggleMenu(folderId, {
      x: Math.max(8, right - FOLDER_OPTIONS_MENU_WIDTH),
      y: bottom + 4,
    });
  };

  const handleOpenRenameFolder = (folderId: string) => {
    const targetFolder = folders.find((folder) => folder.id === folderId);
    if (!targetFolder || access.folderLocks[folderId] !== false) {
      return;
    }

    folderOptionsMenu.closeMenu();
    setFolderNameModal({
      mode: "rename",
      folderId,
      value: targetFolder.name,
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    if (isRemovingFolder || isReorderingFolder) {
      return;
    }

    const redirectPath =
      activeFolderId === folderId
        ? getRedirectPathAfterFolderDelete(folderId)
        : null;

    void removeFolder(folderId)
      .then(() => {
        folderOptionsMenu.closeMenu();
        notifySuccess(feedback("folderDeleted"));
        onFolderDeleted(redirectPath);
      })
      .catch(() => {
        notifyError(t("folderActionError"));
      });
  };

  return (
    <>
      <FolderSidebarSection
        folders={folders}
        isError={isError}
        isLoading={isLoading}
        isRetrying={isRetrying}
        pathname={pathname}
        addFolderLabel={t("addFolder")}
        reorderFolderLabel={t("reorderFolder")}
        moveFolderUpLabel={t("moveFolderUp")}
        moveFolderDownLabel={t("moveFolderDown")}
        openFolderOptionsLabel={t("openFolderOptions")}
        renameLabel={t("rename")}
        deleteLabel={t("delete")}
        optionsMenu={folderOptionsMenu.menu}
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
          if (!access.canCreateFolder) {
            setShowCreateLimit(true);
            return;
          }
          setShowCreateLimit(false);
          setFolderNameModal({ mode: "create", value: "" });
        }}
        onNavigate={onNavigate}
        onRetry={onRetry}
        onDragStart={handleFolderDragStart}
        onDragEnd={clearFolderDragState}
        onDragOver={handleFolderDragOver}
        onDrop={handleFolderDrop}
        onMoveFolderUp={(folderId) => handleMoveFolder(folderId, "up")}
        onMoveFolderDown={(folderId) => handleMoveFolder(folderId, "down")}
        onToggleOptions={handleToggleFolderOptions}
        onOpenOptionsMenu={folderOptionsMenu.openContextMenu}
        onRenameFolder={handleOpenRenameFolder}
        onDeleteFolder={(id) => setDeleteFolderId(id)}
      />

      {showCreateLimit ? (
        <div
          className="m-3 space-y-2 rounded-lg border border-(--border) p-3 text-xs"
          role="status"
        >
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1">
              {access.status === "ready"
                ? a("folderLimit")
                : a("checkingDescription")}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={a("closeFolderLimit")}
              onClick={() => setShowCreateLimit(false)}
            >
              <HiX className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-(--foreground)">
            <Link
              href="/pricing"
              className="font-medium underline! decoration-1 underline-offset-4"
            >
              {a("plans")}
            </Link>
            <button
              type="button"
              onClick={() => void access.refresh()}
              className="cursor-pointer font-medium underline! decoration-1 underline-offset-4"
            >
              {a("retry")}
            </button>
          </div>
        </div>
      ) : null}
      <ConfirmActionModal
        isOpen={deleteFolderId !== null}
        title={a("deleteFolderTitle")}
        description={a("deleteFolderDescription")}
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        isConfirming={isRemovingFolder}
        onCancel={() => setDeleteFolderId(null)}
        onConfirm={() => {
          if (deleteFolderId) {
            handleDeleteFolder(deleteFolderId);
            setDeleteFolderId(null);
          }
        }}
      />
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
          isSubmitting={isFolderNameSubmitting}
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
