"use client";

import { useTranslations } from "next-intl";
import { HiOutlinePaperClip, HiX } from "react-icons/hi";

interface WorkspaceSidebarHeaderProps {
  onCloseMobile?: () => void;
}

export function WorkspaceSidebarHeader({
  onCloseMobile,
}: WorkspaceSidebarHeaderProps) {
  const t = useTranslations("sidebar");

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
          aria-label={t("closeSidebar")}
        >
          <HiX className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
