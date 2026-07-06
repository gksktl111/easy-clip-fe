"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useInView } from "react-intersection-observer";
import { TrashListRow } from "@/features/trash/ui/TrashListRow";
import { TrashItemRow } from "@/features/trash/ui/trashRow";

interface TrashListSectionProps {
  rows: TrashItemRow[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  pendingActionKey: string | null;
  selectedRowKeys: Set<string>;
  onFetchNextPage?: () => void;
  onToggleRow: (row: TrashItemRow) => void;
  onToggleAllRows: () => void;
  onRestoreFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRestoreClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
}

// 휴지통 항목 목록의 헤더, 스크롤 영역, 각 행 렌더링을 묶는 리스트 섹션 컴포넌트입니다.
export function TrashListSection({
  rows,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  pendingActionKey,
  selectedRowKeys,
  onFetchNextPage,
  onToggleRow,
  onToggleAllRows,
  onRestoreFolder,
  onDeleteFolder,
  onRestoreClip,
  onDeleteClip,
}: TrashListSectionProps) {
  const t = useTranslations("trash");
  const skeletonRows = Array.from({ length: 6 }, (_, index) => index);
  const hasTriggeredInViewRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "240px 0px",
  });
  const allRowsSelected =
    rows.length > 0 &&
    rows.every((row) => selectedRowKeys.has(`${row.kind}-${row.id}`));

  useEffect(() => {
    if (!inView) {
      hasTriggeredInViewRef.current = false;
      return;
    }

    if (!hasNextPage || isFetchingNextPage || isLoading || !onFetchNextPage) {
      return;
    }

    if (hasTriggeredInViewRef.current) {
      return;
    }

    hasTriggeredInViewRef.current = true;
    onFetchNextPage();
  }, [hasNextPage, inView, isFetchingNextPage, isLoading, onFetchNextPage]);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-(--surface)">
      <div className="flex items-center justify-between border-y border-(--border) bg-(--surface-muted) px-4 py-3 min-[1200px]:hidden">
        <label className="flex min-w-0 items-center gap-3 text-sm font-medium text-(--foreground)">
          <input
            type="checkbox"
            checked={allRowsSelected}
            disabled={isLoading || rows.length === 0}
            onChange={onToggleAllRows}
            className="h-4 w-4 cursor-pointer rounded border-(--border) accent-(--primary) disabled:cursor-default"
          />
          <span>{t("selectAll")}</span>
        </label>
      </div>

      <div className="hidden grid-cols-[2rem_minmax(0,1.5fr)_180px_220px_220px] items-center gap-4 border-y border-(--border) bg-(--surface-muted) px-4 py-3 text-xs font-semibold tracking-wide text-(--muted) uppercase min-[1200px]:grid min-[1200px]:px-6">
        <input
          type="checkbox"
          checked={allRowsSelected}
          disabled={isLoading || rows.length === 0}
          onChange={onToggleAllRows}
          className="h-4 w-4 cursor-pointer rounded border-(--border) accent-(--primary) disabled:cursor-default"
          aria-label={t("selectAll")}
        />
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
                isSelected={selectedRowKeys.has(`${row.kind}-${row.id}`)}
                pendingActionKey={pendingActionKey}
                onToggleSelected={onToggleRow}
                onRestoreFolder={onRestoreFolder}
                onDeleteFolder={onDeleteFolder}
                onRestoreClip={onRestoreClip}
                onDeleteClip={onDeleteClip}
              />
            ))}

        {!isLoading ? (
          <div ref={loadMoreRef}>
            {isFetchingNextPage ? <TrashListSkeletonRow /> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TrashListSkeletonRow() {
  return (
    <article className="px-4 py-4 min-[1200px]:px-6" aria-hidden>
      <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 min-[1200px]:grid-cols-[2rem_minmax(0,1.5fr)_180px_220px_220px] min-[1200px]:items-center min-[1200px]:gap-4">
        <div className="mt-3 h-4 w-4 rounded border border-(--border) min-[1200px]:mt-0" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
            <div className="skeleton-shimmer h-3 w-1/2 rounded-md" />
          </div>
        </div>

        <div className="skeleton-shimmer col-start-2 h-7 w-24 rounded-full min-[1200px]:col-start-auto" />
        <div className="skeleton-shimmer col-start-2 h-4 w-32 rounded-md min-[1200px]:col-start-auto" />
        <div className="col-start-2 flex flex-wrap justify-end gap-2 min-[1200px]:col-start-auto min-[1200px]:justify-start">
          <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
          <div className="skeleton-shimmer h-8 w-20 rounded-lg" />
        </div>
      </div>
    </article>
  );
}
