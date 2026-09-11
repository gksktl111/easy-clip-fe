"use client";

import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { useAuth } from "@/features/auth";
import { useTranslations } from "next-intl";
import { requestAccessRefresh } from "@/shared/access/accessEvents";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import {
  confirmBillingAuthOnce,
  BillingConfirmationAlreadySubmittedError,
} from "@/features/subscription/service/confirmBillingAuthOnce";
import type { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";
import { syncMySubscriptionQueryData } from "@/features/subscription/service/subscriptionQueryCache";
import { BillingResultCard } from "@/features/subscription/ui/BillingResultCard";

const notifiedConfirmations = new WeakSet<Promise<MySubscriptionResponseDto>>();

// 결제 리다이렉트 결과를 서버에서 확정하고 성공 또는 실패 화면을 표시합니다.
interface BillingResultPageProps {
  authKey?: string;
  customerKey?: string;
  errorMessage?: string;
  status: "success" | "fail";
}

export function BillingResultPage(props: BillingResultPageProps) {
  const { user } = useAuth();
  return <BillingResultContent key={user?.id ?? "anonymous"} {...props} />;
}

function BillingResultContent({
  authKey,
  customerKey,
  errorMessage,
  status,
}: BillingResultPageProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const t = useTranslations("access");
  const feedback = useTranslations("feedback");
  const notified = useRef(false);
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
    if ((status === "fail" || isMissingSuccessParams) && !notified.current) {
      notified.current = true;
      notifyError(feedback("billingFailed"));
    }
    if (status !== "success" || !authKey || !customerKey || !user) {
      return;
    }

    let active = true;
    // Toss 성공 리다이렉트의 authKey/customerKey를 서버에 전달해 최종 구독 승인을 완료한다.
    const confirmation = confirmBillingAuthOnce(user.id, {
      authKey,
      customerKey,
    });
    confirmation
      .then((nextSubscription) => {
        if (!active) return;
        syncMySubscriptionQueryData(queryClient, nextSubscription, user.id);
        setSubscription(nextSubscription);
        setMessage(
          t(
            nextSubscription.plan === "PRO"
              ? "billingSuccess"
              : "billingUncertain",
          ),
        );
        if (!notifiedConfirmations.has(confirmation)) {
          notifiedConfirmations.add(confirmation);
          if (nextSubscription.plan === "PRO")
            notifySuccess(feedback("billingConfirmed"));
          else notifyError(feedback("billingFailed"));
        }
      })
      .catch((error) => {
        if (!active) return;
        if (
          !notifiedConfirmations.has(confirmation) &&
          !(error instanceof BillingConfirmationAlreadySubmittedError)
        ) {
          notifiedConfirmations.add(confirmation);
          notifyError(feedback("billingFailed"));
        }
        requestAccessRefresh();
        setMessage(
          `${error instanceof Error && !(error instanceof BillingConfirmationAlreadySubmittedError) ? error.message : ""} ${t("billingUncertain")}`,
        );
      })
      .finally(() => {
        if (active) setIsConfirming(false);
      });
    return () => {
      active = false;
    };
  }, [
    authKey,
    customerKey,
    queryClient,
    status,
    user,
    t,
    feedback,
    isMissingSuccessParams,
  ]);

  const isSuccess = status === "success" && subscription?.plan === "PRO";

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-5 py-10">
      {isSuccess ? (
        <Confetti
          width={viewportSize.width}
          height={viewportSize.height}
          recycle={false}
          numberOfPieces={220}
          className="pointer-events-none motion-reduce:hidden"
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
