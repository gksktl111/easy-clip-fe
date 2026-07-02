"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DeleteAllClipsModal } from "@/features/clip/ui/DeleteAllClipsModal";
import { useTrashPage } from "@/features/trash/hooks/useTrashPage";
import { TrashListSection } from "@/features/trash/ui/TrashListSection";
import { TrashPageEmptyState } from "@/features/trash/ui/TrashPageEmptyState";
import { TrashPageHeader } from "@/features/trash/ui/TrashPageHeader";
import { TrashItemRow } from "@/features/trash/ui/trashRow";

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
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] =
    useState(false);
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
    hasItems,
    pendingActionKey,
    reload,
    handleRestoreClip,
    handleDeleteClip,
    handleDeleteItems,
    handleRestoreFolder,
    handleDeleteFolder,
    handleClearAll,
  } = useTrashPage();
  const folderNameById = new Map([
    ...activeFolders.map((folder) => [folder.id, folder.name] as const),
    ...items
      .filter((item) => item.itemType === "FOLDER")
      .map((folder) => [folder.id, folder.name] as const),
  ]);

  const rows: TrashItemRow[] = items.map((item) => {
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
  const isDeletingSelected = pendingActionKey === "trash-delete-selected";
  const rowKey = (row: TrashItemRow) => `${row.kind}-${row.id}`;
  const selectedRows = rows.filter((row) => selectedRowKeys.has(rowKey(row)));

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

    await handleDeleteItems(
      selectedRows.map((row) => ({
        itemType: row.kind === "clip" ? "CLIP" : "FOLDER",
        id: row.id,
      })),
    );
    setSelectedRowKeys(new Set());
  };

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <TrashPageHeader
        count={rows.length}
        selectedCount={selectedRows.length}
        isLoading={isLoading}
        isClearingAll={isClearingAll}
        isDeletingSelected={isDeletingSelected}
        onReload={() => {
          void reload();
        }}
        onRequestClearAll={() => setIsClearAllModalOpen(true)}
        onRequestDeleteSelected={() => setIsDeleteSelectedModalOpen(true)}
      />

      {error ? (
        <div className="px-6 pt-6">
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {t("error")}
          </p>
        </div>
      ) : null}

      {!isLoading && !hasItems ? <TrashPageEmptyState /> : null}

      {isLoading || hasItems ? (
        <div className="flex min-h-0 flex-1 flex-col">
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
        </div>
      ) : null}

      <DeleteAllClipsModal
        isOpen={isClearAllModalOpen}
        title={t("clearAllModal.title")}
        description={t("clearAllModal.description")}
        cancelLabel={t("cancel")}
        confirmLabel={t("clearAll")}
        onCancel={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          setIsClearAllModalOpen(false);
          void handleClearAll();
        }}
      />

      <DeleteAllClipsModal
        isOpen={isDeleteSelectedModalOpen}
        title={t("deleteSelectedModal.title", { count: selectedRows.length })}
        description={t("deleteSelectedModal.description", {
          count: selectedRows.length,
        })}
        cancelLabel={t("cancel")}
        confirmLabel={t("deleteSelected")}
        onCancel={() => setIsDeleteSelectedModalOpen(false)}
        onConfirm={() => {
          setIsDeleteSelectedModalOpen(false);
          void handleDeleteSelected();
        }}
      />
    </div>
  );
}
