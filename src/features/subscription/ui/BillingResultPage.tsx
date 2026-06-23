"use client";

import { useEffect, useState } from "react";
import { confirmBillingAuth } from "@/features/subscription/api/subscriptionApi";
import { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";
import { BillingResultCard } from "@/features/subscription/ui/BillingResultCard";

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

    // Toss 성공 리다이렉트의 authKey/customerKey를 서버에 전달해 최종 구독 승인을 완료한다.
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
      <BillingResultCard
        isConfirming={isConfirming}
        isMissingSuccessParams={isMissingSuccessParams}
        isSuccess={isSuccess}
        message={message}
        status={status}
        subscription={subscription}
      />
    </main>
  );
}
