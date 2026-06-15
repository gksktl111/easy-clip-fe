"use client";

import { useTranslations } from "next-intl";
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
  const {
    clips,
    folders,
    activeFolders,
    isLoading,
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
    ...folders.map((folder) => [folder.id, folder.name] as const),
  ]);

  const rows: TrashItemRow[] = [
    ...folders.map((folder) => ({
      kind: "folder" as const,
      id: folder.id,
      name: folder.name,
      deletedAt: folder.deletedAt,
      typeLabel: t("folderType"),
    })),
    ...clips.map((clip) => ({
      kind: "clip" as const,
      id: clip.id,
      name: clip.title,
      deletedAt: clip.deletedAt,
      typeLabel: `${t("fileType")} · ${getClipTypeLabel(clip.type, t)}`,
      clipType: clip.type,
      parentFolderName:
        folderNameById.get(clip.folderId) ?? t("unknownParentFolder"),
    })),
  ].sort((left, right) => {
    const leftTime = left.deletedAt ? new Date(left.deletedAt).getTime() : 0;
    const rightTime = right.deletedAt ? new Date(right.deletedAt).getTime() : 0;

    return rightTime - leftTime;
  });

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <TrashPageHeader />

      {error ? (
        <div className="px-6 pt-6">
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {t("error")}
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <p className="text-sm text-(--muted)">{t("loading")}</p>
        </div>
      ) : null}

      {!isLoading && !hasItems ? (
        <TrashPageEmptyState />
      ) : null}

      {!isLoading && hasItems ? (
        <div className="flex min-h-0 flex-1 flex-col px-4 py-4 min-[1200px]:px-6">
          <TrashListSection
            rows={rows}
            pendingActionKey={pendingActionKey}
            onReload={() => {
              void reload();
            }}
            onClearAll={() => {
              void handleClearAll();
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
    </div>
  );
}
