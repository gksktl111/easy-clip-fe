"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiChevronDown,
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineLogout,
} from "react-icons/hi";
import { ActionMenu } from "@/shared/ui/menu/ActionMenu";

interface AppSidebarFooterProps {
  userLabel: string;
  settingsLabel: string;
  logoutLabel: string;
  upgradePlanLabel: string;
  onOpenSettings: () => void;
  onUpgradePlan: () => void;
  onLogout: () => void;
}

export function AppSidebarFooter({
  userLabel,
  settingsLabel,
  logoutLabel,
  upgradePlanLabel,
  onOpenSettings,
  onUpgradePlan,
  onLogout,
}: AppSidebarFooterProps) {
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
          <ActionMenu
            className="right-0 bottom-full left-0 mb-2 w-auto rounded-xl bg-(--surface-elevated) shadow-xl"
            itemClassName="gap-3 px-3 py-2.5 font-medium transition-colors duration-150 ease-out hover:bg-(--dropdown-option-hover) motion-reduce:transition-none"
            items={[
              {
                label: settingsLabel,
                icon: (
                  <HiOutlineCog
                    className="h-5 w-5 text-(--muted)"
                    aria-hidden
                  />
                ),
                onClick: () => handleMenuAction(onOpenSettings),
              },
              {
                label: upgradePlanLabel,
                icon: (
                  <HiOutlineCreditCard
                    className="h-5 w-5 text-(--muted)"
                    aria-hidden
                  />
                ),
                onClick: () => handleMenuAction(onUpgradePlan),
              },
              {
                label: logoutLabel,
                icon: (
                  <HiOutlineLogout
                    className="h-5 w-5 text-(--muted)"
                    aria-hidden
                  />
                ),
                onClick: () => handleMenuAction(onLogout),
              },
            ]}
          />
        ) : null}

        <button
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-(--surface) px-3 py-2 transition-colors hover:bg-(--surface-elevated)"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
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
