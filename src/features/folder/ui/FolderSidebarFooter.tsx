"use client";

import { HiOutlineCog, HiOutlineLogout } from "react-icons/hi";

interface FolderSidebarFooterProps {
  email: string;
  settingsLabel: string;
  logoutLabel: string;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function FolderSidebarFooter({
  email,
  settingsLabel,
  logoutLabel,
  onOpenSettings,
  onLogout,
}: FolderSidebarFooterProps) {
  return (
    <div className="border-t border-(--border) px-4 py-4">
      <div className="mb-3 flex items-center justify-between rounded-lg bg-(--surface) px-3 py-2">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-(--icon-chip) text-[10px] font-semibold text-(--icon-chip-text)">
            EC
          </div>
          <span className="text-foreground truncate text-sm font-medium">
            {email}
          </span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-muted hover:text-foreground cursor-pointer rounded p-1 transition-colors"
          aria-label={logoutLabel}
        >
          <HiOutlineLogout className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) transition-colors hover:bg-(--surface)"
      >
        <HiOutlineCog className="h-5 w-5" aria-hidden />
        {settingsLabel}
      </button>
    </div>
  );
}
