import { HiOutlineRefresh } from "react-icons/hi";
import { useFormatter, useTranslations } from "next-intl";
import { PRO_MONTHLY_DISPLAY_AMOUNT } from "@/shared/config/planDisplay";
import type { BillingStep } from "@/features/subscription/model/billing";
import { BillingUnlockedFeatureList } from "@/features/subscription/ui/BillingUnlockedFeatureList";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";

// Pro 요금, 제공 기능과 결제 시작 상태를 하나의 카드로 표시합니다.
interface BillingCheckoutCardProps {
  actionLabel: string;
  onStartBilling: () => void;
  step: BillingStep;
}

export function BillingCheckoutCard({
  actionLabel,
  onStartBilling,
  step,
}: BillingCheckoutCardProps) {
  const isProcessing = step === "loading" || step === "redirecting";
  const t = useTranslations("billing");
  const format = useFormatter();

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) p-5">
      <div className="flex items-start justify-between gap-4 border-b border-(--border) pb-5">
        <div>
          <p className="text-sm font-medium text-(--muted)">EasyClip Pro</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-semibold">
              {format.number(PRO_MONTHLY_DISPLAY_AMOUNT, {
                style: "currency",
                currency: "KRW",
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="pb-1 text-sm text-(--muted)">{t("perMonth")}</span>
          </div>
        </div>
        <Badge variant="muted" size="sm">
          {t("monthly")}
        </Badge>
      </div>

      <BillingUnlockedFeatureList />
      <p className="mt-5 text-sm leading-6 text-(--muted)">{t("renewal")}</p>

      <Button
        onClick={onStartBilling}
        disabled={isProcessing}
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <HiOutlineRefresh className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {actionLabel}
      </Button>
    </div>
  );
}
