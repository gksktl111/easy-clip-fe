"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { confirmBillingAuth } from "@/features/subscription/api/subscriptionApi";
import { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";
import { syncMySubscriptionQueryData } from "@/features/subscription/service/subscriptionQueryCache";
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
  const queryClient = useQueryClient();
  const isMissingSuccessParams =
    status === "success" && (!authKey || !customerKey);
  const [subscription, setSubscription] =
    useState<MySubscriptionResponseDto | null>(null);
  const [message, setMessage] = useState<string | null>(errorMessage ?? null);
  const [isConfirming, setIsConfirming] = useState(
    status === "success" && !isMissingSuccessParams,
  );
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const syncViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    syncViewportSize();
    window.addEventListener("resize", syncViewportSize);

    return () => window.removeEventListener("resize", syncViewportSize);
  }, []);

  useEffect(() => {
    if (status !== "success" || !authKey || !customerKey) {
      return;
    }

    // Toss 성공 리다이렉트의 authKey/customerKey를 서버에 전달해 최종 구독 승인을 완료한다.
    confirmBillingAuth({ authKey, customerKey })
      .then((nextSubscription) => {
        syncMySubscriptionQueryData(queryClient, nextSubscription, null);
        setSubscription(nextSubscription);
        setMessage("Pro 구독이 활성화되었습니다.");
      })
      .catch(() => {
        setMessage("결제 승인을 완료하지 못했습니다.");
      })
      .finally(() => setIsConfirming(false));
  }, [authKey, customerKey, queryClient, status]);

  const isSuccess = status === "success" && subscription?.plan === "PRO";

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-5 py-10">
      {isSuccess ? (
        <Confetti
          width={viewportSize.width}
          height={viewportSize.height}
          recycle={false}
          numberOfPieces={220}
          className="pointer-events-none"
        />
      ) : null}
      <BillingResultCard
        isConfirming={isConfirming}
        isMissingSuccessParams={isMissingSuccessParams}
        isSuccess={isSuccess}
        message={message}
        status={status}
      />
    </main>
  );
}
