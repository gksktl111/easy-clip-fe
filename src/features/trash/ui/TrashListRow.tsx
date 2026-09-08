"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlinePhotograph,
} from "react-icons/hi";
import { formatDeletedAt } from "@/features/trash/ui/trashRow";
import type { TrashItemRow } from "@/features/trash/model/trashRow";
import { Button } from "@/shared/ui/button/Button";
import { Checkbox } from "@/shared/ui/input/Checkbox";
import { Text } from "@/shared/ui/typography/Text";

interface TrashListRowProps {
  row: TrashItemRow;
  isSelected: boolean;
  pendingActionKey: string | null;
  onToggleSelected: (row: TrashItemRow) => void;
  onRestoreFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRestoreClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
}

function TrashRowIcon({ row }: { row: TrashItemRow }) {
  if (row.kind === "folder") {
    return <HiOutlineFolder className="h-5 w-5" aria-hidden />;
  }

  if (row.clipType === "IMAGE") {
    return <HiOutlinePhotograph className="h-5 w-5" aria-hidden />;
  }

  if (row.clipType === "COLOR") {
    return <HiOutlineColorSwatch className="h-5 w-5" aria-hidden />;
  }

  return <HiOutlineDocumentText className="h-5 w-5" aria-hidden />;
}

// 휴지통 항목 하나를 파일/폴더 유형과 액션까지 포함해 한 줄로 렌더링하는 컴포넌트입니다.
export function TrashListRow({
  row,
  isSelected,
  pendingActionKey,
  onToggleSelected,
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
  const areActionsDisabled = pendingActionKey !== null;

  return (
    <article
      data-selected={isSelected}
      aria-busy={
        pendingActionKey === restoreActionKey ||
        pendingActionKey === deleteActionKey
      }
      className="px-4 py-4 transition-colors hover:bg-(--surface-muted) data-[selected=true]:bg-(--surface-muted) min-[1200px]:px-6"
    >
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 min-[1200px]:grid-cols-[1.5rem_minmax(0,1fr)_minmax(8rem,0.45fr)_minmax(10rem,0.6fr)] min-[1200px]:items-center min-[1200px]:gap-4">
        <div className="flex items-start pt-1 min-[1200px]:items-center min-[1200px]:pt-0">
          <Checkbox
            checked={isSelected}
            disabled={areActionsDisabled}
            onChange={() => onToggleSelected(row)}
            aria-label={t("selectItem", { name: row.name })}
          />
        </div>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center text-(--muted)">
            <TrashRowIcon row={row} />
          </div>

          <div className="min-w-0">
            <Text
              variant="bodyStrong"
              className="[overflow-wrap:anywhere] break-words"
            >
              {row.name}
            </Text>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--muted)">
              <span>{row.typeLabel}</span>
              {row.kind === "clip" ? (
                <span className="min-w-0 [overflow-wrap:anywhere] break-words">
                  <span aria-hidden>· </span>
                  {t("parentFolder")}: {row.parentFolderName}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <Text
          variant="caption"
          className="col-start-2 min-[1200px]:col-start-auto min-[1200px]:text-xs"
        >
          <span className="mr-2 min-[1200px]:hidden">{t("deletedAt")}:</span>
          {formatDeletedAt(row.deletedAt)}
        </Text>

        <div className="col-start-2 flex flex-wrap justify-start gap-2 min-[1200px]:col-start-auto min-[1200px]:justify-start">
          <Button
            disabled={
              areActionsDisabled || pendingActionKey === restoreActionKey
            }
            onClick={() => {
              if (row.kind === "folder") {
                onRestoreFolder(row.id);
                return;
              }

              onRestoreClip(row.id);
            }}
            variant="secondary"
            size="xs"
          >
            {pendingActionKey === restoreActionKey
              ? t("restoringSelectedAction")
              : t("restore")}
          </Button>
          <Button
            disabled={
              areActionsDisabled || pendingActionKey === deleteActionKey
            }
            onClick={() => {
              if (row.kind === "folder") {
                onDeleteFolder(row.id);
                return;
              }

              onDeleteClip(row.id);
            }}
            variant="dangerOutline"
            size="xs"
          >
            {pendingActionKey === deleteActionKey
              ? t("deletingSelectedAction")
              : t("deleteForever")}
          </Button>
        </div>
      </div>
    </article>
  );
}
