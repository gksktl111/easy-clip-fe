import { useTranslations } from "next-intl";
import Link from "next/link";
import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

// 결제 승인 진행, 성공 또는 실패 상태와 다음 이동 액션을 표시합니다.
interface BillingResultCardProps {
  isConfirming: boolean;
  isMissingSuccessParams: boolean;
  isSuccess: boolean;
  message: string | null;
  status: "success" | "fail";
}

export function BillingResultCard({
  isConfirming,
  isMissingSuccessParams,
  isSuccess,
  message,
  status,
}: BillingResultCardProps) {
  const t = useTranslations("access");
  return (
    <section className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface-elevated) p-6 text-center shadow-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--surface-muted)">
        {isSuccess ? (
          <HiCheckCircle className="h-7 w-7 text-(--success)" aria-hidden />
        ) : (
          <HiExclamationCircle
            className="h-7 w-7 text-(--danger)"
            aria-hidden
          />
        )}
      </div>
      <h1 className="mt-5 text-2xl font-semibold">
        {status === "success" ? t("billingChecking") : t("billingFailed")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-(--muted)">
        {isConfirming
          ? t("billingLoading")
          : (message ??
            (isMissingSuccessParams
              ? t("billingMissing")
              : t("billingUncertain")))}
      </p>

      <Link
        href={isSuccess ? "/recent" : "/pricing"}
        className="mt-6 flex cursor-pointer items-center justify-center rounded-xl bg-(--primary) px-4 py-3 text-sm font-semibold transition hover:bg-(--primary-hover)"
      >
        {isSuccess ? (
          <span className="text-primary-foreground">{t("openApp")}</span>
        ) : (
          <span className="text-primary-foreground">
            {t("checkSubscription")}
          </span>
        )}
      </Link>
    </section>
  );
}
