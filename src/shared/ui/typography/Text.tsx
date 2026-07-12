import { createElement } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

// 순수 텍스트 출력의 크기, 굵기, 색상 조합을 표준화합니다.
type TextVariant =
  | "pageTitle"
  | "sectionLabel"
  | "itemTitle"
  | "body"
  | "bodyMuted"
  | "bodyStrong"
  | "caption"
  | "captionStrong";

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: ReactNode;
  variant?: TextVariant;
}

const variantClassName: Record<TextVariant, string> = {
  pageTitle: "text-xl font-semibold text-(--foreground)",
  sectionLabel: "text-sm font-semibold text-(--muted)",
  itemTitle: "text-sm font-semibold",
  body: "text-sm text-(--foreground)",
  bodyMuted: "text-sm text-(--muted)",
  bodyStrong: "text-sm font-medium text-(--foreground)",
  caption: "text-xs text-(--muted)",
  captionStrong: "text-xs font-medium text-(--foreground)",
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Text({
  as = "p",
  children,
  className,
  variant = "body",
  ...props
}: TextProps) {
  return createElement(
    as,
    {
      className: classNames(variantClassName[variant], className),
      ...props,
    },
    children,
  );
}
