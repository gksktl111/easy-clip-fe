"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  HiCheck,
  HiOutlineCreditCard,
  HiOutlineRefresh,
} from "react-icons/hi";
import {
  createBillingAuthRequest,
  fetchMySubscription,
} from "@/features/subscription/api/subscriptionApi";
import { BillingAuthRequestResponseDto } from "@/features/subscription/model/subscription.dto";
import { ApiError } from "@/shared/lib/apiClient";

type BillingStep = "idle" | "loading" | "ready" | "redirecting" | "error";

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
const PRO_UNLOCKED_FEATURES = [
  "무제한 프로젝트 생성",
  "프로젝트당 최대 500개 클립 저장",
  "무제한 기기 연동",
  "태그 기반 클립 정리",
  "AI 기능 우선 제공 예정",
] as const;

const loadTossPaymentsScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("결제 환경을 확인할 수 없습니다."));
      return;
    }

    if (window.TossPayments) {
      resolve();
      return;
    }

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
    script.onerror = () => reject(new Error("결제 모듈을 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

const mapBillingAuthMethod = (method: BillingAuthRequestResponseDto["method"]) =>
  method === "CARD" ? "카드" : method;

export function BillingPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Awaited<
    ReturnType<typeof fetchMySubscription>
  > | null>(null);
  const [billingAuth, setBillingAuth] =
    useState<BillingAuthRequestResponseDto | null>(null);
  const [step, setStep] = useState<BillingStep>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isProActive =
    subscription?.plan === "PRO" && subscription.status === "ACTIVE";
  const actionLabel = useMemo(() => {
    if (step === "loading") {
      return "결제 정보 준비 중";
    }

    if (step === "redirecting") {
      return "결제 인증 이동 중";
    }

    return isProActive ? "이미 Pro 사용 중" : "카드 인증하고 Pro 시작";
  }, [isProActive, step]);

  useEffect(() => {
    let isMounted = true;

    fetchMySubscription()
      .then((nextSubscription) => {
        if (isMounted) {
          setSubscription(nextSubscription);
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          setMessage("로그인 후 Pro 결제를 진행할 수 있습니다.");
          return;
        }

        setMessage("구독 정보를 불러오지 못했습니다.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartBilling = async () => {
    if (isProActive || step === "loading" || step === "redirecting") {
      return;
    }

    setStep("loading");
    setMessage(null);

    try {
      const request = await createBillingAuthRequest();
      setBillingAuth(request);
      setStep("redirecting");

      await loadTossPaymentsScript();

      const tossPayments = window.TossPayments?.(request.clientKey);
      if (!tossPayments) {
        throw new Error("결제 모듈을 시작하지 못했습니다.");
      }

      await tossPayments.requestBillingAuth(mapBillingAuthMethod(request.method), {
        customerKey: request.customerKey,
        successUrl: request.successUrl,
        failUrl: request.failUrl,
      });
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
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-6 sm:px-5 sm:py-8 md:grid-cols-[0.95fr_1.05fr] md:gap-8 md:px-8 md:py-12">
        <div className="flex flex-col justify-center">
          <Link
            href="/pricing"
            className="w-fit cursor-pointer rounded-lg px-1 py-1 text-sm font-medium text-(--muted) transition hover:text-(--foreground)"
          >
            요금제로 돌아가기
          </Link>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-sm text-(--muted)">
              <HiOutlineCreditCard className="h-4 w-4" aria-hidden />
              Pro subscription
            </div>
            <h1 className="mt-5 text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl">
              Pro로 업그레이드
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-(--muted)">
              월 3,900원으로 프로젝트와 기기 제한을 확장합니다. 카드 인증이
              완료되면 서버에서 구독 상태를 Pro로 갱신합니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3">
            {["무제한 프로젝트", "기기 제한 해제", "태그 정리"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-3 text-sm font-medium"
              >
                <HiCheck className="h-4 w-4 text-(--success)" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 shadow-xl sm:p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-(--border) pb-5">
              <div>
                <p className="text-sm font-medium text-(--muted)">EasyClip Pro</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold sm:text-4xl">₩3,900</span>
                  <span className="pb-1 text-sm text-(--muted)">/ month</span>
                </div>
              </div>
              <span className="rounded-full bg-(--surface-muted) px-3 py-1 text-xs font-semibold text-(--muted)">
                월간
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-(--border) bg-(--surface-muted) p-4">
              <p className="text-sm font-semibold">Pro 구독 시 해금되는 기능</p>
              <ul className="mt-4 space-y-3">
                {PRO_UNLOCKED_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary) text-(--primary-foreground)">
                      <HiCheck className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="leading-6">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {billingAuth ? (
              <div className="mt-4 rounded-xl border border-(--border) px-4 py-3 text-sm text-(--muted)">
                <p className="font-medium text-(--foreground)">결제 인증 정보</p>
                <p className="mt-1 break-all">customerKey: {billingAuth.customerKey}</p>
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
                void handleStartBilling();
              }}
              disabled={isProActive || step === "loading" || step === "redirecting"}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === "loading" || step === "redirecting" ? (
                <HiOutlineRefresh
                  className="h-4 w-4 animate-spin"
                  aria-hidden
                />
              ) : null}
              {actionLabel}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
