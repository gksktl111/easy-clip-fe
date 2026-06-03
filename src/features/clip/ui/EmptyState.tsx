"use client";

import { HiOutlineClipboardCopy } from "react-icons/hi";

export function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="flex max-w-sm flex-col items-center rounded-3xl border border-dashed border-(--border) bg-(--surface) px-8 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--icon-chip) text-(--icon-chip-text)">
          <HiOutlineClipboardCopy className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-foreground mt-5 text-base font-semibold">
          아직 저장된 클립이 없습니다
        </p>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          새 클립을 복사하거나 폴더에서 붙여넣기를 시작하면 이곳에 표시됩니다.
        </p>
      </div>
    </div>
  );
}
