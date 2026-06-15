"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HiOutlineRefresh } from "react-icons/hi";
import { DeleteAllClipsModal } from "@/features/clip/ui/DeleteAllClipsModal";
import { TrashListRow } from "@/features/trash/ui/TrashListRow";
import { TrashItemRow } from "@/features/trash/ui/trashRow";

interface TrashListSectionProps {
  rows: TrashItemRow[];
  isLoading?: boolean;
  pendingActionKey: string | null;
  onReload: () => void;
  onClearAll: () => void;
  onRestoreFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRestoreClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
}

// 휴지통 항목 목록의 헤더, 스크롤 영역, 각 행 렌더링을 묶는 리스트 섹션 컴포넌트입니다.
export function TrashListSection({
  rows,
  isLoading = false,
  pendingActionKey,
  onReload,
  onClearAll,
  onRestoreFolder,
  onDeleteFolder,
  onRestoreClip,
  onDeleteClip,
}: TrashListSectionProps) {
  const t = useTranslations("trash");
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
        <div className="flex items-center justify-between gap-3 border-b border-(--border) px-4 py-4">
          <div>
            <h2 className="text-base font-semibold text-(--foreground)">
              {t("listTitle")}
            </h2>
            <p className="text-sm text-(--muted)">
              {isLoading ? t("loading") : t("totalCount", { count: rows.length })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                isLoading ||
                !rows.length ||
                pendingActionKey === "trash-clear-all"
              }
              onClick={() => setIsClearAllModalOpen(true)}
              className="cursor-pointer rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/25 disabled:cursor-default disabled:opacity-50"
            >
              {t("clearAll")}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onReload}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-(--border) text-(--foreground) transition hover:bg-(--surface) disabled:cursor-default disabled:opacity-50"
              aria-label={t("refresh")}
              title={t("refresh")}
            >
              <HiOutlineRefresh className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(0,1.5fr)_180px_220px_220px] items-center gap-4 border-b border-(--border) bg-(--surface-elevated) px-4 py-3 text-xs font-semibold tracking-wide text-(--muted) uppercase min-[1200px]:grid">
          <span>{t("columns.name")}</span>
          <span>{t("columns.type")}</span>
          <span>{t("columns.deletedAt")}</span>
          <span>{t("columns.actions")}</span>
        </div>

        <div className="clip-scrollbar min-h-0 flex-1 divide-y divide-(--border) overflow-y-auto">
          {isLoading
            ? skeletonRows.map((row) => <TrashListSkeletonRow key={row} />)
            : rows.map((row) => (
                <TrashListRow
                  key={`${row.kind}-${row.id}`}
                  row={row}
                  pendingActionKey={pendingActionKey}
                  onRestoreFolder={onRestoreFolder}
                  onDeleteFolder={onDeleteFolder}
                  onRestoreClip={onRestoreClip}
                  onDeleteClip={onDeleteClip}
                />
              ))}
        </div>
      </section>

      <DeleteAllClipsModal
        isOpen={isClearAllModalOpen}
        title={t("clearAllModal.title")}
        description={t("clearAllModal.description")}
        cancelLabel={t("cancel")}
        confirmLabel={t("clearAll")}
        onCancel={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          setIsClearAllModalOpen(false);
          onClearAll();
        }}
      />
    </>
  );
}

function TrashListSkeletonRow() {
  return (
    <article
      className="px-4 py-4"
      aria-hidden
    >
      <div className="flex flex-col gap-3 min-[1200px]:grid min-[1200px]:grid-cols-[minmax(0,1.5fr)_180px_220px_220px] min-[1200px]:items-center min-[1200px]:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="trash-skeleton h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="trash-skeleton h-4 w-2/3 rounded-md" />
            <div className="trash-skeleton h-3 w-1/2 rounded-md" />
          </div>
        </div>

        <div className="trash-skeleton h-7 w-24 rounded-full" />
        <div className="trash-skeleton h-4 w-32 rounded-md" />
        <div className="flex flex-wrap justify-end gap-2 min-[1200px]:justify-start">
          <div className="trash-skeleton h-8 w-16 rounded-lg" />
          <div className="trash-skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    </article>
  );
}
