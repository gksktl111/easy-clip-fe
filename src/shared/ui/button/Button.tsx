import type { ButtonHTMLAttributes, ReactNode } from "react";

// 앱 전반에서 반복되는 버튼 스타일과 상태 표현을 표준화합니다.
type ButtonVariant =
  | "primary"
  | "secondary"
  | "secondarySurface"
  | "secondaryMuted"
  | "pricing"
  | "pricingFeatured"
  | "chip"
  | "surfaceGhost"
  | "danger"
  | "dangerSoft"
  | "dangerOutline"
  | "ghost";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover)",
  secondary:
    "border border-(--border) bg-transparent text-(--foreground) hover:bg-(--surface-muted)",
  secondarySurface:
    "border border-(--border) bg-(--surface) text-(--foreground) hover:bg-(--surface-muted)",
  secondaryMuted:
    "border border-(--border) bg-(--surface-muted) text-(--foreground) hover:bg-(--surface-elevated)",
  pricing:
    "bg-(--pricing-button-bg) text-(--pricing-button-fg) hover:bg-(--pricing-button-bg-hover)",
  pricingFeatured:
    "bg-(--pricing-button-featured-bg) text-(--pricing-button-featured-fg) hover:bg-(--pricing-button-featured-bg-hover)",
  chip: "bg-(--icon-chip) text-(--icon-chip-text)",
  surfaceGhost: "bg-(--surface) text-(--muted) hover:bg-(--surface-muted)",
  danger: "bg-(--danger) text-danger-foreground hover:bg-(--danger-hover)",
  dangerSoft: "bg-red-500/15 text-red-500 hover:bg-red-500/25",
  dangerOutline: "border border-red-500/25 text-red-500 hover:bg-red-500/10",
  ghost: "text-(--muted) hover:bg-(--surface-muted) hover:text-(--foreground)",
};

const sizeClassName: Record<ButtonSize, string> = {
  xs: "min-h-0 rounded-lg px-3 py-2 text-xs",
  sm: "min-h-9 rounded-lg px-4 py-2 text-sm",
  md: "h-10 rounded-lg px-3 text-sm",
  lg: "min-h-11 rounded-xl px-5 py-3 text-sm",
  icon: "h-10 w-10 rounded-lg p-0",
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  children,
  className,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition disabled:cursor-default disabled:opacity-50",
        variantClassName[variant],
        sizeClassName[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
