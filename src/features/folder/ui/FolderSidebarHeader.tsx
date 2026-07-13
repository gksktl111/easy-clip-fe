"use client";

import { HiOutlinePaperClip, HiX } from "react-icons/hi";

// 사이드바 상단에 브랜드와 모바일 닫기 액션을 표시합니다.
interface FolderSidebarHeaderProps {
  onCloseMobile?: () => void;
}

export function FolderSidebarHeader({
  onCloseMobile,
}: FolderSidebarHeaderProps) {
  return (
    <div className="border-b border-(--border) px-4 py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HiOutlinePaperClip className="h-5 w-5" aria-hidden />
          <h1 className="text-foreground text-xl font-semibold">Easy Clip</h1>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="flex h-9 w-9 items-center justify-center rounded-full text-(--muted) transition hover:bg-(--surface) hover:text-(--foreground) md:hidden"
          aria-label="사이드바 닫기"
        >
          <HiX className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
