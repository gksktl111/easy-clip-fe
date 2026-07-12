import type { HTMLAttributes, ReactNode } from "react";

// 짧은 상태, 수량, 강조 정보를 pill 형태로 표시하는 공통 뱃지입니다.
type BadgeVariant =
  | "chip"
  | "muted"
  | "mutedStrong"
  | "elevated"
  | "featured";

type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClassName: Record<BadgeVariant, string> = {
  chip: "bg-(--icon-chip) text-(--icon-chip-text)",
  muted: "bg-(--surface-muted) text-(--muted)",
  mutedStrong: "bg-(--surface-muted) text-(--foreground)",
  elevated: "bg-(--surface-elevated) text-(--muted)",
  featured: "text-white",
};

const sizeClassName: Record<BadgeSize, string> = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Badge({
  children,
  className,
  variant = "muted",
  size = "xs",
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full font-semibold",
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
