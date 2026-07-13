"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFolderActions } from "@/features/folder/hooks/useFolderActions";
import type {
  FolderDropPosition,
  FolderItem,
} from "@/features/folder/model/folder";
import { FolderNameModal } from "@/features/folder/ui/FolderNameModal";
import { FolderSidebarSection } from "@/features/folder/ui/FolderSidebarSection";

interface FolderSidebarContentProps {
  folders: FolderItem[];
  isLoading?: boolean;
  pathname: string;
  isAuthenticated: boolean;
  onNavigate?: () => void;
  onAuthenticationRequired: () => void;
  onFolderDeleted: (redirectPath: string | null) => void;
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

// 폴더 생성, 이름 변경, 삭제와 정렬 상호작용만 관리합니다.
export function FolderSidebarContent({
  folders,
  isLoading = false,
  pathname,
  isAuthenticated,
  onNavigate,
  onAuthenticationRequired,
  onFolderDeleted,
}: FolderSidebarContentProps) {
  const t = useTranslations("sidebar");
  const { createFolder, removeFolder, renameFolder, saveFolderOrder } =
    useFolderActions();
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
  const pathnameFolderId = pathname.split("/").filter(Boolean)[0] ?? null;

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

  const ensureAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }

    onAuthenticationRequired();
    return false;
  }, [isAuthenticated, onAuthenticationRequired]);

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
        // 최종 순서 저장 실패 시 query가 서버 순서로 다시 동기화됩니다.
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
    if (!trimmedName || !ensureAuthenticated()) {
      return;
    }

    const request =
      folderNameModal.mode === "create"
        ? createFolder(trimmedName)
        : renameFolder(folderNameModal.folderId, trimmedName);

    void request.then(closeFolderNameModal).catch(() => {
      // 실패 내용을 확인하고 재시도할 수 있도록 모달을 유지합니다.
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

    const redirectPath =
      pathnameFolderId === folderId
        ? getRedirectPathAfterFolderDelete(folderId)
        : null;

    void removeFolder(folderId)
      .then(() => {
        setOpenOptionsFolderId(null);
        onFolderDeleted(redirectPath);
      })
      .catch(() => {
        // 실패 내용을 확인하고 재시도할 수 있도록 옵션 메뉴를 유지합니다.
      });
  };

  return (
    <>
      <FolderSidebarSection
        folders={folders}
        isLoading={isLoading}
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
        onNavigate={onNavigate}
        onDragStart={handleFolderDragStart}
        onDragEnd={clearFolderDragState}
        onDragOver={handleFolderDragOver}
        onDrop={handleFolderDrop}
        onToggleOptions={handleToggleFolderOptions}
        onRenameFolder={handleOpenRenameFolder}
        onDeleteFolder={handleDeleteFolder}
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
