"use client";

import { useTranslations } from "next-intl";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBillingAuthRequestMutation } from "@/features/subscription/mutations/useCreateBillingAuthRequestMutation";
import { useSubscriptionActions } from "@/features/subscription/mutations/useSubscriptionActions";
import type { BillingStep } from "@/features/subscription/model/billing";
import { useMySubscription } from "@/features/subscription/queries/useMySubscription";
import { hasRemainingCanceledProPeriod } from "@/features/subscription/service/subscriptionPolicy";
import { requestBillingAuth } from "@/features/subscription/service/tossPaymentsSdk";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { ApiError } from "@/shared/lib/apiClient";

// 구독 확인, 재개, SDK 인증과 오류 복구를 결제 페이지의 단일 사용자 흐름으로 조합합니다.
export const useBillingAuthFlow = () => {
  const pending = useRef(false);
  const t = useTranslations("feedback");
  const pricing = useTranslations("pricing");
  const router = useRouter();

  const { invalidateSubscription, resumeSubscription } =
    useSubscriptionActions();

  const { refetchSubscription } = useMySubscription();

  const { mutateAsync: createBillingAuthRequest } =
    useCreateBillingAuthRequestMutation();

  const [step, setStep] = useState<BillingStep>("idle");

  const startBilling = useCallback(async () => {
    if (pending.current || step === "loading" || step === "redirecting") {
      return;
    }

    pending.current = true;
    setStep("loading");

    try {
      const currentSubscription = await refetchSubscription();

      if (hasRemainingCanceledProPeriod(currentSubscription)) {
        await resumeSubscription();
        setStep("idle");
        notifySuccess(pricing("toasts.resumeSuccess"));
        router.push("/pricing");
        return;
      }

      const request = await createBillingAuthRequest();
      setStep("redirecting");
      await requestBillingAuth(request);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError && error.status === 409) {
        const latestSubscription = await refetchSubscription().catch(
          () => null,
        );

        if (!latestSubscription) {
          void invalidateSubscription();
        }
      }

      setStep("error");
      notifyError(t("billingStartError"));
    } finally {
      pending.current = false;
    }
  }, [
    createBillingAuthRequest,
    invalidateSubscription,
    resumeSubscription,
    refetchSubscription,
    router,
    step,
    t,
    pricing,
  ]);

  return { startBilling, step };
};
