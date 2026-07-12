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
  return (
    <section className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface-elevated) p-6 text-center shadow-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--surface-muted)">
        {status === "success" ? (
          <HiCheckCircle className="h-7 w-7 text-(--success)" aria-hidden />
        ) : (
          <HiExclamationCircle
            className="h-7 w-7 text-(--danger)"
            aria-hidden
          />
        )}
      </div>
      <h1 className="mt-5 text-2xl font-semibold">
        {status === "success" ? "결제 확인" : "결제 실패"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-(--muted)">
        {isConfirming
          ? "결제 승인 정보를 확인하고 있습니다."
          : (message ??
            (isMissingSuccessParams
              ? "결제 승인 정보가 부족합니다."
              : "결제 페이지에서 다시 시도해 주세요."))}
      </p>

      <Link
        href={isSuccess ? "/recent" : "/billing"}
        className="mt-6 flex cursor-pointer items-center justify-center rounded-xl bg-(--primary) px-4 py-3 text-sm font-semibold transition hover:bg-(--primary-hover)"
      >
        {isSuccess ? (
          <span className="text-primary-foreground">앱으로 이동</span>
        ) : (
          <span className="text-primary-foreground">결제 다시 시도</span>
        )}
      </Link>
    </section>
  );
}
