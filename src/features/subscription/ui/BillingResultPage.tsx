"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { confirmBillingAuth } from "@/features/subscription/api/subscriptionApi";
import { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";

interface BillingResultPageProps {
  authKey?: string;
  customerKey?: string;
  errorMessage?: string;
  status: "success" | "fail";
}

export function BillingResultPage({
  authKey,
  customerKey,
  errorMessage,
  status,
}: BillingResultPageProps) {
  const isMissingSuccessParams =
    status === "success" && (!authKey || !customerKey);
  const [subscription, setSubscription] =
    useState<MySubscriptionResponseDto | null>(null);
  const [message, setMessage] = useState<string | null>(errorMessage ?? null);
  const [isConfirming, setIsConfirming] = useState(
    status === "success" && !isMissingSuccessParams,
  );

  useEffect(() => {
    if (status !== "success" || !authKey || !customerKey) {
      return;
    }

    confirmBillingAuth({ authKey, customerKey })
      .then((nextSubscription) => {
        setSubscription(nextSubscription);
        setMessage("Pro 구독이 활성화되었습니다.");
      })
      .catch(() => {
        setMessage("결제 승인을 완료하지 못했습니다.");
      })
      .finally(() => setIsConfirming(false));
  }, [authKey, customerKey, status]);

  const isSuccess = status === "success" && subscription?.plan === "PRO";

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-(--border) bg-(--surface-elevated) p-6 text-center shadow-xl">
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

        {subscription ? (
          <div className="mt-5 rounded-xl border border-(--border) bg-(--surface-muted) px-4 py-3 text-sm">
            현재 플랜: <span className="font-semibold">{subscription.plan}</span>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={isSuccess ? "/recent" : "/billing"}
            className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
          >
            {isSuccess ? "앱으로 이동" : "결제 다시 시도"}
          </Link>
          <Link
            href="/pricing"
            className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-(--border) px-4 py-3 text-sm font-semibold transition hover:bg-(--surface-muted)"
          >
            요금제 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
