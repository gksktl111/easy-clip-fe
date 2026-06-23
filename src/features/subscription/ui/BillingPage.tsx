"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBillingAuthRequest } from "@/features/subscription/api/subscriptionApi";
import { BillingAuthRequestResponseDto } from "@/features/subscription/model/subscription.dto";
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

export function BillingPage() {
  const router = useRouter();
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
