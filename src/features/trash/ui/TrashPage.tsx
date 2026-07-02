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

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <TrashPageHeader
        count={rows.length}
        isLoading={isLoading}
        isClearingAll={isClearingAll}
        onReload={() => {
          void reload();
        }}
        onRequestClearAll={() => setIsClearAllModalOpen(true)}
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
            onFetchNextPage={() => {
              void fetchNextPage();
            }}
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
    </div>
  );
}
