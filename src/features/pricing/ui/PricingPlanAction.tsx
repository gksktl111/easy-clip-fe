import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { Button } from "@/shared/ui/button/Button";

type PricingPlanActionProps = {
  children: ReactNode;
  featured?: boolean;
} & (
  | {
      href: ComponentProps<typeof Link>["href"];
      kind: "link";
    }
  | {
      disabled?: boolean;
      kind: "button";
      onClick?: MouseEventHandler<HTMLButtonElement>;
    }
);

const actionClassName =
  "mt-8 rounded-2xl font-semibold transition-[background-color,opacity,transform] duration-200 hover:opacity-90";

const standardLinkActionClassName =
  "inline-flex w-full cursor-pointer items-center justify-center bg-(--pricing-button-bg) px-5 py-3 text-sm text-(--pricing-button-fg) hover:bg-(--pricing-button-bg-hover)";

const featuredLinkActionClassName =
  "inline-flex w-full cursor-pointer items-center justify-center bg-(--pricing-button-featured-bg) px-5 py-3 text-sm text-(--pricing-button-featured-fg) hover:bg-(--pricing-button-featured-bg-hover)";

const getLinkActionColor = (featured: boolean) =>
  featured ? "var(--pricing-button-featured-fg)" : "var(--pricing-button-fg)";

// 요금제 카드의 일반·강조 CTA에 맞춰 링크·버튼 시맨틱과 색상 대비를 적용합니다.
export function PricingPlanAction(props: PricingPlanActionProps) {
  if (props.kind === "link") {
    return (
      <Link
        href={props.href}
        className={`${actionClassName} ${
          props.featured
            ? featuredLinkActionClassName
            : standardLinkActionClassName
        }`}
        style={{ color: getLinkActionColor(Boolean(props.featured)) }}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      variant={props.featured ? "pricingFeatured" : "pricing"}
      size="lg"
      fullWidth
      className={actionClassName}
    >
      {props.children}
    </Button>
  );
}
