"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DeleteAllClipsModal } from "@/features/clip/ui/DeleteAllClipsModal";
import { useTrashPage } from "@/features/trash/hooks/useTrashPage";
import { TrashListSection } from "@/features/trash/ui/TrashListSection";
import { TrashPageEmptyState } from "@/features/trash/ui/TrashPageEmptyState";
import { TrashPageHeader } from "@/features/trash/ui/TrashPageHeader";
import type { TrashItemRow } from "@/features/trash/ui/trashRow";

const getClipTypeLabel = (
  clipType: "TEXT" | "COLOR" | "IMAGE",
  t: ReturnType<typeof useTranslations<"trash">>,
) => {
  if (clipType === "TEXT") {
    return t("clipKinds.text");
  }

  if (clipType === "COLOR") {
    return t("clipKinds.color");
  }

  return t("clipKinds.image");
};

// 휴지통 페이지의 상태에 따라 안내, 빈 상태, 리스트 섹션을 조합하는 루트 컴포넌트입니다.
export function TrashPage() {
  const t = useTranslations("trash");
  const [deleteModal, setDeleteModal] = useState<
    "clearAll" | "selected" | null
  >(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const {
    items,
    activeFolders,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    pendingActionKey,
    reload,
    handleRestoreClip,
    handleRestoreItems,
    handleDeleteClip,
    handleDeleteItems,
    handleRestoreFolder,
    handleDeleteFolder,
    handleClearAll,
  } = useTrashPage();
  const deletedFolderIds = new Set(
    items
      .filter((item) => item.itemType === "FOLDER")
      .map((folder) => folder.id),
  );
  const folderNameById = new Map([
    ...activeFolders.map((folder) => [folder.id, folder.name] as const),
    ...items
      .filter((item) => item.itemType === "FOLDER")
      .map((folder) => [folder.id, folder.name] as const),
  ]);

  const rows: TrashItemRow[] = items
    .filter(
      (item) =>
        item.itemType === "FOLDER" || !deletedFolderIds.has(item.folderId),
    )
    .map((item) => {
      if (item.itemType === "FOLDER") {
        return {
          kind: "folder",
          id: item.id,
          name: item.name,
          deletedAt: item.deletedAt,
          typeLabel: t("folderType"),
        };
      }

      return {
        kind: "clip",
        id: item.id,
        name: item.title,
        deletedAt: item.deletedAt,
        typeLabel: `${t("fileType")} · ${getClipTypeLabel(item.type, t)}`,
        clipType: item.type,
        parentFolderName:
          folderNameById.get(item.folderId) ?? t("unknownParentFolder"),
      };
    });
  const isClearingAll = pendingActionKey === "trash-clear-all";
  const isRestoringSelected = pendingActionKey === "trash-restore-selected";
  const isDeletingSelected = pendingActionKey === "trash-delete-selected";
  const isActionPending = pendingActionKey !== null;
  const rowKey = (row: TrashItemRow) => `${row.kind}-${row.id}`;
  const selectedRows = rows.filter((row) => selectedRowKeys.has(rowKey(row)));
  const hasRows = rows.length > 0;
  const errorMessage =
    error === "restoreConflict"
      ? t("restoreConflictError")
      : error === "action"
        ? t("actionError")
        : t("error");

  const handleToggleRow = (row: TrashItemRow) => {
    setSelectedRowKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);
      const key = rowKey(row);

      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }

      return nextKeys;
    });
  };

  const handleToggleAllRows = () => {
    setSelectedRowKeys((currentKeys) => {
      const areAllRowsSelected =
        rows.length > 0 && rows.every((row) => currentKeys.has(rowKey(row)));

      if (areAllRowsSelected) {
        return new Set();
      }

      return new Set(rows.map(rowKey));
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      return;
    }

    const isDeleted = await handleDeleteItems(
      selectedRows.map((row) => ({
        itemType: row.kind === "clip" ? "CLIP" : "FOLDER",
        id: row.id,
      })),
    );

    if (isDeleted) {
      setSelectedRowKeys(new Set());
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedRows.length === 0) {
      return;
    }

    const isRestored = await handleRestoreItems(
      selectedRows.map((row) => ({
        itemType: row.kind === "clip" ? "CLIP" : "FOLDER",
        id: row.id,
      })),
    );

    if (isRestored) {
      setSelectedRowKeys(new Set());
    }
  };

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <TrashPageHeader
        count={rows.length}
        selectedCount={selectedRows.length}
        isLoading={isLoading}
        isActionPending={isActionPending}
        isClearingAll={isClearingAll}
        isRestoringSelected={isRestoringSelected}
        isDeletingSelected={isDeletingSelected}
        onReload={() => {
          void reload();
        }}
        onRequestClearAll={() => setDeleteModal("clearAll")}
        onRestoreSelected={() => {
          void handleRestoreSelected();
        }}
        onRequestDeleteSelected={() => setDeleteModal("selected")}
      />

      {error ? (
        <div className="p-6 pt-6">
          <p
            className="rounded-xl border border-(--danger-border) bg-(--danger-surface) px-4 py-3 text-sm text-(--danger-text)"
            role="alert"
          >
            {errorMessage}
          </p>
        </div>
      ) : null}

      {!isLoading && !hasRows ? <TrashPageEmptyState /> : null}

      {isLoading || hasRows ? (
        <TrashListSection
          rows={rows}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          pendingActionKey={pendingActionKey}
          selectedRowKeys={selectedRowKeys}
          onFetchNextPage={() => {
            void fetchNextPage();
          }}
          onToggleRow={handleToggleRow}
          onToggleAllRows={handleToggleAllRows}
          onRestoreFolder={(folderId) => {
            void handleRestoreFolder(folderId);
          }}
          onDeleteFolder={(folderId) => {
            void handleDeleteFolder(folderId);
          }}
          onRestoreClip={(clipId) => {
            void handleRestoreClip(clipId);
          }}
          onDeleteClip={(clipId) => {
            void handleDeleteClip(clipId);
          }}
        />
      ) : null}

      <DeleteAllClipsModal
        isOpen={deleteModal !== null}
        title={
          deleteModal === "selected"
            ? t("deleteSelectedModal.title", { count: selectedRows.length })
            : t("clearAllModal.title")
        }
        description={
          deleteModal === "selected"
            ? t("deleteSelectedModal.description", {
                count: selectedRows.length,
              })
            : t("clearAllModal.description")
        }
        cancelLabel={t("cancel")}
        confirmLabel={
          deleteModal === "selected" ? t("deleteSelected") : t("clearAll")
        }
        onCancel={() => setDeleteModal(null)}
        onConfirm={() => {
          const target = deleteModal;
          setDeleteModal(null);

          if (target === "selected") {
            void handleDeleteSelected();
          } else {
            void handleClearAll();
          }
        }}
      />
    </div>
  );
}
