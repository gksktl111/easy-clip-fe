import { confirmBillingAuth } from "@/features/subscription/api/subscriptionApi";
import type {
  ConfirmBillingAuthDto,
  MySubscriptionResponseDto,
} from "@/features/subscription/model/subscription.dto";

const confirmations = new Map<string, Promise<MySubscriptionResponseDto>>();

export class BillingConfirmationAlreadySubmittedError extends Error {
  constructor() {
    super("BILLING_CONFIRMATION_ALREADY_SUBMITTED");
  }
}

// confirm에는 서버 멱등키 계약이 없으므로 같은 인증 결과를 자동으로 다시 청구하지 않습니다.
export const confirmBillingAuthOnce = (
  userId: string,
  payload: ConfirmBillingAuthDto,
) => {
  const identity = JSON.stringify([
    userId,
    payload.authKey,
    payload.customerKey,
  ]);
  const existing = confirmations.get(identity);
  if (existing) return existing;
  const promise = (async () => {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(identity),
    );
    const key = `billing-confirm:${Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, "0")).join("")}`;
    // 인증 키 자체는 저장하지 않습니다. 오류/타임아웃도 제출 이력을 유지합니다.
    if (sessionStorage.getItem(key))
      throw new BillingConfirmationAlreadySubmittedError();
    sessionStorage.setItem(key, "submitted");
    return confirmBillingAuth(payload);
  })();
  confirmations.set(identity, promise);
  return promise;
};
