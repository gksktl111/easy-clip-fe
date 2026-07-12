"use client";

import { useTranslations } from "next-intl";
import {
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlinePhotograph,
} from "react-icons/hi";
import { formatDeletedAt, TrashItemRow } from "@/features/trash/ui/trashRow";
import { Badge } from "@/shared/ui/badge/Badge";
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
    <article className="px-4 py-4 transition-colors hover:bg-(--surface-elevated) min-[1200px]:px-6">
      <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 min-[1200px]:grid-cols-[2rem_minmax(0,1.5fr)_180px_220px_220px] min-[1200px]:items-center min-[1200px]:gap-4">
        <div className="flex items-start pt-3 min-[1200px]:items-center min-[1200px]:pt-0">
          <Checkbox
            checked={isSelected}
            disabled={areActionsDisabled}
            onChange={() => onToggleSelected(row)}
            aria-label={t("selectItem", { name: row.name })}
          />
        </div>
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
            <Text variant="bodyStrong" className="truncate">
              {row.name}
            </Text>
            {row.kind === "clip" ? (
              <Text variant="caption" className="mt-1 truncate">
                {t("parentFolder")}: {row.parentFolderName}
              </Text>
            ) : null}
            <Text variant="caption" className="mt-1 min-[1200px]:hidden">
              {row.typeLabel}
            </Text>
          </div>
        </div>

        <div className="col-start-2 min-[1200px]:col-start-auto">
          <Badge variant="elevated" className="font-medium">
            {row.typeLabel}
          </Badge>
        </div>

        <Text
          variant="caption"
          className="col-start-2 min-[1200px]:col-start-auto min-[1200px]:text-sm"
        >
          <span className="mr-2 min-[1200px]:hidden">{t("deletedAt")}:</span>
          {formatDeletedAt(row.deletedAt)}
        </Text>

        <div className="col-start-2 flex flex-wrap justify-end gap-2 min-[1200px]:col-start-auto min-[1200px]:justify-start">
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
            {t("restore")}
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
            variant="dangerSoft"
            size="xs"
          >
            {t("deleteForever")}
          </Button>
        </div>
      </div>
    </article>
  );
}
