"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createBillingAuthRequest,
  fetchMySubscription,
  updateMySubscription,
} from "@/features/subscription/api/subscriptionApi";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
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
import { ApiError } from "@/shared/lib/apiClient";

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

const loadTossPaymentsScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("결제 환경을 확인할 수 없습니다."));
      return;
    }

    // Toss SDK는 결제 시작 시점에만 필요하므로 초기 번들에 포함하지 않는다.
    if (window.TossPayments) {
      resolve();
      return;
    }

    // 기존 script가 로딩 중인 경우 중복 삽입하지 않고 완료 이벤트만 구독한다.
    const existingScript = document.getElementById(TOSS_PAYMENTS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("결제 모듈을 불러오지 못했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = TOSS_PAYMENTS_SCRIPT_ID;
    script.src = TOSS_PAYMENTS_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

const mapBillingAuthMethod = (
  method: BillingAuthRequestResponseDto["method"],
) => (method === "CARD" ? "카드" : method);

// 구독 상태를 확인하고 Toss 카드 인증 진입과 오류 복구 UI를 조합합니다.
export function BillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useAuthSession();
  const userId = session?.user?.id ?? null;
  const [billingAuth, setBillingAuth] =
    useState<BillingAuthRequestResponseDto | null>(null);
  const [step, setStep] = useState<BillingStep>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleStartBilling = async () => {
    if (step === "loading" || step === "redirecting") {
      return;
    }

    setStep("loading");
    setMessage(null);

    try {
      const currentSubscription = await fetchMySubscription();

      if (hasRemainingCanceledProPeriod(currentSubscription)) {
        const nextSubscription = await updateMySubscription({ type: "RESUME" });
        syncMySubscriptionQueryData(queryClient, nextSubscription, userId);
        setStep("idle");
        setMessage("Pro 구독 자동갱신이 재개되었습니다.");
        router.push("/pricing");
        return;
      }

      // 백엔드가 customerKey/successUrl/failUrl을 생성하고,
      // 프론트는 해당 값으로 Toss 빌링 인증 화면만 호출한다.
      const request = await createBillingAuthRequest();
      setBillingAuth(request);
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
      setMessage(
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
          billingAuth={billingAuth}
          message={message}
          onStartBilling={() => {
            void handleStartBilling();
          }}
          step={step}
        />
      </section>
    </main>
  );
}
