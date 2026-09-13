"use client";

import { useResourceAccess } from "@/shared/access/ResourceAccessContext";
import { ResourceAccessLoading } from "@/shared/access/ResourceAccessLoading";
import { ResourceAccessNotice } from "@/shared/access/ResourceAccessNotice";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTrashPage } from "@/features/trash/hooks/useTrashPage";
import { useTrashSelection } from "@/features/trash/hooks/useTrashSelection";
import {
  TrashListSection,
  TrashListSkeleton,
} from "@/features/trash/ui/TrashListSection";
import { TrashPageEmptyState } from "@/features/trash/ui/TrashPageEmptyState";
import { TrashSelectionBar } from "@/features/trash/ui/TrashSelectionBar";
import { TrashPageHeader } from "@/features/trash/ui/TrashPageHeader";
import type { TrashFolderReference } from "@/features/trash/service/trashRowMapper";
import { ConfirmActionModal } from "@/shared/ui/overlay/ConfirmActionModal";

// 휴지통 페이지의 상태에 따라 안내, 빈 상태, 리스트 섹션을 조합하는 루트 컴포넌트입니다.
interface TrashPageProps {
  activeFolders: TrashFolderReference[];
  onItemsChanged?: () => void | Promise<void>;
}

export function TrashPage({ activeFolders, onItemsChanged }: TrashPageProps) {
  const t = useTranslations("trash");
  const access = useResourceAccess();
  const [deleteModal, setDeleteModal] = useState<
    "clearAll" | "selected" | null
  >(null);
  const { actions, results } = useTrashPage({
    activeFolders,
    onItemsChanged,
  });
  const { rows } = results;
  const {
    clearSelection,
    selectedItems,
    selectedRowKeys,
    selectedRows,
    toggleAllRows,
    toggleRow,
  } = useTrashSelection(rows);
  const isClearingAll = actions.pendingActionKey === "trash-clear-all";
  const isRestoringSelected =
    actions.pendingActionKey === "trash-restore-selected";
  const isDeletingSelected =
    actions.pendingActionKey === "trash-delete-selected";
  const isActionPending = actions.pendingActionKey !== null;
  const hasRows = rows.length > 0;
  const errorMessage = t("error");

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    const isDeleted = await actions.deleteItems(selectedItems);

    if (isDeleted) {
      clearSelection();
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    const isRestored = await actions.restoreItems(selectedItems);

    if (isRestored) {
      clearSelection();
    }
  };

  if (access.status === "checking")
    return (
      <ResourceAccessLoading>
        <TrashListSkeleton />
      </ResourceAccessLoading>
    );
  if (access.status !== "ready") return <ResourceAccessNotice />;

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <TrashPageHeader
        count={rows.length}
        isLoading={results.isLoading}
        isActionPending={isActionPending}
        isClearingAll={isClearingAll}
        onReload={() => {
          void actions.reload();
        }}
        onRequestClearAll={() => setDeleteModal("clearAll")}
      />

      {results.error ? (
        <div className="p-6 pt-6">
          <p
            className="rounded-xl border border-(--danger-border) bg-(--danger-surface) px-4 py-3 text-sm text-(--danger-text)"
            role="alert"
          >
            {errorMessage}
          </p>
        </div>
      ) : null}

      {!results.isLoading && !hasRows && !results.error ? (
        <TrashPageEmptyState />
      ) : null}

      {results.isLoading || hasRows ? (
        <TrashListSection
          rows={rows}
          isLoading={results.isLoading}
          hasNextPage={results.hasNextPage}
          isFetchingNextPage={results.isFetchingNextPage}
          pendingActionKey={actions.pendingActionKey}
          selectedRowKeys={selectedRowKeys}
          onFetchNextPage={() => {
            void results.fetchNextPage();
          }}
          onToggleRow={toggleRow}
          onToggleAllRows={toggleAllRows}
          onRestoreFolder={(folderId) => {
            void actions.restoreFolder(folderId);
          }}
          onDeleteFolder={(folderId) => {
            void actions.deleteFolder(folderId);
          }}
          onRestoreClip={(clipId) => {
            void actions.restoreClip(clipId);
          }}
          onDeleteClip={(clipId) => {
            void actions.deleteClip(clipId);
          }}
        />
      ) : null}

      {selectedRows.length > 0 ? (
        <TrashSelectionBar
          count={selectedRows.length}
          pending={isActionPending}
          restoring={isRestoringSelected}
          deleting={isDeletingSelected}
          onCancel={clearSelection}
          onRestore={() => void handleRestoreSelected()}
          onDelete={() => setDeleteModal("selected")}
        />
      ) : null}

      <ConfirmActionModal
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
            void actions.clearAll();
          }
        }}
      />
    </div>
  );
}
