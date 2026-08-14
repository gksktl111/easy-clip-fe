import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { Button } from "@/shared/ui/button/Button";

type PricingPlanActionProps =
  | {
      children: ReactNode;
      href: ComponentProps<typeof Link>["href"];
      kind: "link";
    }
  | {
      children: ReactNode;
      disabled?: boolean;
      kind: "button";
      onClick?: MouseEventHandler<HTMLButtonElement>;
    };

const actionClassName =
  "mt-8 rounded-2xl font-semibold transition-[background-color,opacity,transform] duration-200 hover:opacity-90";

const linkActionClassName =
  "inline-flex w-full cursor-pointer items-center justify-center bg-(--pricing-button-bg) px-5 py-3 text-sm text-(--pricing-button-fg) hover:bg-(--pricing-button-bg-hover)";

// 요금제 카드 CTA의 링크·버튼 시맨틱을 유지하면서 Free 카드 디자인을 일관되게 적용합니다.
export function PricingPlanAction(props: PricingPlanActionProps) {
  if (props.kind === "link") {
    return (
      <Link
        href={props.href}
        className={`${actionClassName} ${linkActionClassName}`}
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
      variant="pricing"
      size="lg"
      fullWidth
      className={actionClassName}
    >
      {props.children}
    </Button>
  );
}
