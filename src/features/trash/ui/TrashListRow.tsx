"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlinePhotograph,
} from "react-icons/hi";
import { formatDeletedAt, TrashItemRow } from "@/features/trash/ui/trashRow";

interface TrashListRowProps {
  row: TrashItemRow;
  pendingActionKey: string | null;
  onRestoreFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRestoreClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
}

// 휴지통 항목 하나를 파일/폴더 유형과 액션까지 포함해 한 줄로 렌더링하는 컴포넌트입니다.
export function TrashListRow({
  row,
  pendingActionKey,
  onRestoreFolder,
  onDeleteFolder,
  onRestoreClip,
  onDeleteClip,
}: TrashListRowProps) {
  const t = useTranslations("trash");
  const restoreActionKey =
    row.kind === "folder"
      ? `folder-restore-${row.id}`
      : `clip-restore-${row.id}`;
  const deleteActionKey =
    row.kind === "folder" ? `folder-delete-${row.id}` : `clip-delete-${row.id}`;

  return (
    <article className="px-4 py-4 transition-colors hover:bg-(--surface-elevated)">
      <div className="flex flex-col gap-3 min-[1200px]:grid min-[1200px]:grid-cols-[minmax(0,1.5fr)_180px_220px_220px] min-[1200px]:items-center min-[1200px]:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--icon-chip) text-(--icon-chip-text)">
            {row.kind === "folder" ? (
              <HiOutlineFolder className="h-5 w-5" aria-hidden />
            ) : row.clipType === "IMAGE" ? (
              <HiOutlinePhotograph className="h-5 w-5" aria-hidden />
            ) : row.clipType === "COLOR" ? (
              <HiOutlineColorSwatch className="h-5 w-5" aria-hidden />
            ) : (
              <HiOutlineDocumentText className="h-5 w-5" aria-hidden />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-(--foreground)">
              {row.name}
            </p>
            {row.kind === "clip" ? (
              <p className="mt-1 truncate text-xs text-(--muted)">
                {t("parentFolder")}: {row.parentFolderName}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-(--muted) min-[1200px]:hidden">
              {row.typeLabel}
            </p>
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-(--surface-elevated) px-2.5 py-1 text-xs font-medium text-(--muted)">
            {row.typeLabel}
          </span>
        </div>

        <p className="text-xs text-(--muted) min-[1200px]:text-sm">
          <span className="mr-2 min-[1200px]:hidden">{t("deletedAt")}:</span>
          {formatDeletedAt(row.deletedAt)}
        </p>

        <div className="flex flex-wrap justify-end gap-2 min-[1200px]:justify-start">
          <button
            type="button"
            disabled={pendingActionKey === restoreActionKey}
            onClick={() => {
              if (row.kind === "folder") {
                onRestoreFolder(row.id);
                return;
              }

              onRestoreClip(row.id);
            }}
            className="cursor-pointer rounded-lg border border-(--border) px-3 py-2 text-xs font-medium text-(--foreground) transition hover:bg-(--surface-muted)"
          >
            {t("restore")}
          </button>
          <button
            type="button"
            disabled={pendingActionKey === deleteActionKey}
            onClick={() => {
              if (row.kind === "folder") {
                onDeleteFolder(row.id);
                return;
              }

              onDeleteClip(row.id);
            }}
            className="cursor-pointer rounded-lg bg-red-500/15 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-500/25"
          >
            {t("deleteForever")}
          </button>
        </div>
      </div>
    </article>
  );
}
