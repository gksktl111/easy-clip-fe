"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiChevronDown,
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineLogout,
} from "react-icons/hi";

interface FolderSidebarFooterProps {
  userLabel: string;
  settingsLabel: string;
  logoutLabel: string;
  upgradePlanLabel: string;
  onOpenSettings: () => void;
  onUpgradePlan: () => void;
  onLogout: () => void;
}

export function FolderSidebarFooter({
  userLabel,
  settingsLabel,
  logoutLabel,
  upgradePlanLabel,
  onOpenSettings,
  onUpgradePlan,
  onLogout,
}: FolderSidebarFooterProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = userLabel.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || menuRef.current?.contains(target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <div className="border-t border-(--border) px-4 py-4">
      <div ref={menuRef} className="relative">
        {isMenuOpen ? (
          <div className="absolute right-0 bottom-full left-0 z-20 mb-2 overflow-hidden rounded-xl border border-(--border) bg-(--surface-elevated) shadow-xl">
            <button
              type="button"
              onClick={() => handleMenuAction(onOpenSettings)}
              className="text-foreground hover:bg-(--dropdown-option-hover) flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-colors"
            >
              <HiOutlineCog className="h-5 w-5 text-(--muted)" aria-hidden />
              {settingsLabel}
            </button>
            <button
              type="button"
              onClick={() => handleMenuAction(onUpgradePlan)}
              className="text-foreground hover:bg-(--dropdown-option-hover) flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-colors"
            >
              <HiOutlineCreditCard
                className="h-5 w-5 text-(--muted)"
                aria-hidden
              />
              {upgradePlanLabel}
            </button>
            <button
              type="button"
              onClick={() => handleMenuAction(onLogout)}
              className="text-foreground hover:bg-(--dropdown-option-hover) flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-colors"
            >
              <HiOutlineLogout
                className="h-5 w-5 text-(--muted)"
                aria-hidden
              />
              {logoutLabel}
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-(--surface) px-3 py-2 transition-colors hover:bg-(--surface-elevated)"
          aria-expanded={isMenuOpen}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--icon-chip) text-[10px] font-semibold text-(--icon-chip-text)">
              {initials}
            </span>
            <span className="text-foreground truncate text-sm font-medium">
              {userLabel}
            </span>
          </span>
          <HiChevronDown
            className={`h-4 w-4 shrink-0 text-(--muted) transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
