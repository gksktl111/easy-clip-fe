"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createBillingAuthRequest,
  fetchMySubscription,
  updateMySubscription,
} from "@/features/subscription/api/subscriptionApi";
import { hasRemainingCanceledProPeriod } from "@/features/subscription/model/subscription";
import type { BillingAuthRequestResponseDto } from "@/features/subscription/model/subscription.dto";
import {
  invalidateMySubscriptionQueries,
  syncMySubscriptionQueryData,
} from "@/features/subscription/service/subscriptionQueryCache";
import {
  BillingCheckoutCard,
  type BillingStep,
} from "@/features/subscription/ui/BillingCheckoutCard";
import { BillingHeroSection } from "@/features/subscription/ui/BillingHeroSection";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { ApiError } from "@/shared/lib/apiClient";
import { useSession } from "@/shared/session/useSession";

interface TossPaymentsClient {
  requestBillingAuth: (
    method: string,
    options: {
      customerKey: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsClient;
  }
}

const TOSS_PAYMENTS_SCRIPT_ID = "toss-payments-sdk";
const TOSS_PAYMENTS_SCRIPT_SRC = "https://js.tosspayments.com/v1/payment";

let tossPaymentsScriptPromise: Promise<void> | null = null;

const loadTossPaymentsScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("결제 환경을 확인할 수 없습니다."));
  }

  // Toss SDK는 결제 시작 시점에만 필요하므로 초기 번들에 포함하지 않는다.
  if (window.TossPayments) {
    return Promise.resolve();
  }

  if (tossPaymentsScriptPromise) {
    return tossPaymentsScriptPromise;
  }

  tossPaymentsScriptPromise = new Promise<void>((resolve, reject) => {
    document.getElementById(TOSS_PAYMENTS_SCRIPT_ID)?.remove();

    const resetScriptPromise = () => {
      tossPaymentsScriptPromise = null;
    };

    const script = document.createElement("script");
    script.id = TOSS_PAYMENTS_SCRIPT_ID;
    script.src = TOSS_PAYMENTS_SCRIPT_SRC;
    script.async = true;

    script.onload = () => {
      resetScriptPromise();
      if (window.TossPayments) {
        resolve();
        return;
      }

      script.remove();
      reject(new Error("결제 모듈을 시작하지 못했습니다."));
    };

    script.onerror = () => {
      resetScriptPromise();
      script.remove();
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };

    document.head.appendChild(script);
  });

  return tossPaymentsScriptPromise;
};

const mapBillingAuthMethod = (
  method: BillingAuthRequestResponseDto["method"],
) => (method === "CARD" ? "카드" : method);

// 구독 상태를 확인하고 Toss 카드 인증 진입과 오류 복구 UI를 조합합니다.
export function BillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [step, setStep] = useState<BillingStep>("idle");

  const handleStartBilling = async () => {
    if (step === "loading" || step === "redirecting") {
      return;
    }

    setStep("loading");

    try {
      const currentSubscription = await fetchMySubscription();

      if (hasRemainingCanceledProPeriod(currentSubscription)) {
        const nextSubscription = await updateMySubscription({ type: "RESUME" });
        syncMySubscriptionQueryData(queryClient, nextSubscription, userId);
        setStep("idle");
        notifySuccess("Pro 구독 자동갱신이 재개되었습니다.");
        router.push("/pricing");
        return;
      }

      // 백엔드가 customerKey/successUrl/failUrl을 생성하고,
      // 프론트는 해당 값으로 Toss 빌링 인증 화면만 호출한다.
      const request = await createBillingAuthRequest();
      setStep("redirecting");

      await loadTossPaymentsScript();

      const tossPayments = window.TossPayments?.(request.clientKey);
      if (!tossPayments) {
        throw new Error("결제 모듈을 시작하지 못했습니다.");
      }

      await tossPayments.requestBillingAuth(
        mapBillingAuthMethod(request.method),
        {
          customerKey: request.customerKey,
          successUrl: request.successUrl,
          failUrl: request.failUrl,
        },
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        const latestSubscription = await fetchMySubscription().catch(
          () => null,
        );

        if (latestSubscription) {
          syncMySubscriptionQueryData(queryClient, latestSubscription, userId);
        } else {
          void invalidateMySubscriptionQueries(queryClient);
        }
      }

      setStep("error");
      notifyError(
        error instanceof Error
          ? error.message
          : "결제 인증을 시작하지 못했습니다.",
      );
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-5 px-4 py-6">
        <BillingHeroSection />
        <BillingCheckoutCard
          actionLabel={
            step === "loading"
              ? "결제 정보 준비 중"
              : step === "redirecting"
                ? "결제 인증 이동 중"
                : "카드 인증하고 Pro 시작"
          }
          onStartBilling={() => {
            void handleStartBilling();
          }}
          step={step}
        />
      </section>
    </main>
  );
}
