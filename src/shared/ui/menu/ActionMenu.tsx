"use client";

import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

// 작은 작업 목록을 표시하는 공통 액션 메뉴입니다.
interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  tone?: "default" | "danger" | "muted";
  disabled?: boolean;
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  className?: string;
  itemClassName?: string;
  position?: "absolute" | "fixed";
  portal?: boolean;
  style?: CSSProperties;
  dataAttribute?: string;
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ActionMenu({
  items,
  className,
  itemClassName,
  position = "absolute",
  portal = false,
  style,
  dataAttribute,
}: ActionMenuProps) {
  const dataProps = dataAttribute ? { [dataAttribute]: true } : {};
  const portalElement = typeof document === "undefined" ? null : document.body;

  const menu = (
    <div
      className={classNames(
        position === "fixed" ? "fixed z-50" : "absolute right-0 z-20",
        "w-32 overflow-hidden rounded-lg border border-(--border) bg-(--surface) shadow-lg",
        className,
      )}
      style={style}
      {...dataProps}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={item.disabled}
          onClick={item.onClick}
          className={classNames(
            "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-(--surface-muted) disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
            item.tone === "danger"
              ? "text-(--danger)"
              : item.tone === "muted"
                ? "text-(--muted) hover:text-(--foreground)"
                : "text-foreground",
            itemClassName,
          )}
          {...dataProps}
        >
          {item.icon}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.shortcut ? (
            <kbd className="text-muted shrink-0 text-[11px] font-medium">
              {item.shortcut}
            </kbd>
          ) : null}
        </button>
      ))}
    </div>
  );

  if (portal && portalElement) {
    return createPortal(menu, portalElement);
  }

  return menu;
}
