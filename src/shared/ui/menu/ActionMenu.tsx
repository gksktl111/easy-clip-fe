import type { CSSProperties, ReactNode } from "react";

// 작은 작업 목록을 표시하는 공통 액션 메뉴입니다.
interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  tone?: "default" | "danger" | "muted";
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  className?: string;
  itemClassName?: string;
  position?: "absolute" | "fixed";
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
  style,
  dataAttribute,
}: ActionMenuProps) {
  const dataProps = dataAttribute ? { [dataAttribute]: true } : {};

  return (
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
          onClick={item.onClick}
          className={classNames(
            "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-(--surface-muted)",
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
          {item.label}
        </button>
      ))}
    </div>
  );
}
