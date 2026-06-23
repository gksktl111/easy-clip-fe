import { HiOutlineRefresh } from "react-icons/hi";
import { BillingAuthRequestResponseDto } from "@/features/subscription/model/subscription.dto";
import { BillingUnlockedFeatureList } from "@/features/subscription/ui/BillingUnlockedFeatureList";

export type BillingStep = "idle" | "loading" | "redirecting" | "error";

interface BillingCheckoutCardProps {
  actionLabel: string;
  billingAuth: BillingAuthRequestResponseDto | null;
  message: string | null;
  onStartBilling: () => void;
  step: BillingStep;
}

export function BillingCheckoutCard({
  actionLabel,
  billingAuth,
  message,
  onStartBilling,
  step,
}: BillingCheckoutCardProps) {
  const isProcessing = step === "loading" || step === "redirecting";

  return (
    <div className="flex items-center">
      <div className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-(--border) pb-5">
          <div>
            <p className="text-sm font-medium text-(--muted)">EasyClip Pro</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold">₩3,900</span>
              <span className="pb-1 text-sm text-(--muted)">/ month</span>
            </div>
          </div>
          <span className="rounded-full bg-(--surface-muted) px-3 py-1 text-xs font-semibold text-(--muted)">
            월간
          </span>
        </div>

        <BillingUnlockedFeatureList />

        {billingAuth ? (
          <div className="mt-4 rounded-xl border border-(--border) px-4 py-3 text-sm text-(--muted)">
            <p className="font-medium text-(--foreground)">결제 인증 정보</p>
            <p className="mt-1 break-all">
              customerKey: {billingAuth.customerKey}
            </p>
          </div>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            onStartBilling();
          }}
          disabled={isProcessing}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <HiOutlineRefresh className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
