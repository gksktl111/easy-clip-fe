import { hasEstimatedProAccess } from "./subscriptionPolicy";
import { ApiError } from "@/shared/lib/apiClient";
import {
  confirmBillingAuth,
  fetchInitialPayment,
  fetchMySubscription,
  reconcileInitialPayment,
} from "../api/subscriptionApi";
import type {
  ConfirmBillingAuthDto,
  InitialPaymentResponseDto,
  MySubscriptionResponseDto,
} from "../model/subscription.dto";
import {
  markBillingAttemptSubmitted,
  readBillingAttempt,
  readActiveBillingAttempt,
  clearActiveBillingAttempt,
  markBillingAttemptRetryable,
  withBillingConfirmationLock,
} from "./billingAttempt";

export type BillingConfirmationAction = "initial" | "check" | "retry";

const confirmations = new Map<
  string,
  { promise: Promise<MySubscriptionResponseDto>; settled: boolean }
>();

export class BillingConfirmationAlreadySubmittedError extends Error {
  constructor() {
    super("BILLING_CONFIRMATION_ALREADY_SUBMITTED");
  }
}
export class BillingPaymentFailedError extends Error {}
export class BillingPaymentRetryableError extends Error {
  constructor() {
    super("BILLING_PAYMENT_RETRYABLE");
  }
}

const isNotFound = (error: unknown) =>
  error instanceof ApiError && error.status === 404;

const confirmedSubscription = async (result: InitialPaymentResponseDto) => {
  if (result.status === "FAILED" || result.status === "CANCELED")
    throw new BillingPaymentFailedError();
  if (result.status !== "DONE")
    throw new BillingConfirmationAlreadySubmittedError();
  return fetchMySubscription();
};

// 응답 유실·새로고침에는 저장한 멱등키로 조회만 하고 승인 요청은 다시 전송하지 않습니다.
export const confirmBillingAuthOnce = (
  userId: string,
  payload: Pick<
    ConfirmBillingAuthDto,
    "authKey" | "customerKey" | "idempotencyKey"
  >,
  action: BillingConfirmationAction = "initial",
) => {
  const identity = JSON.stringify([
    userId,
    payload.authKey,
    payload.customerKey,
    payload.idempotencyKey,
  ]);
  const existing = confirmations.get(identity);
  if (existing && (action === "initial" || !existing.settled))
    return existing.promise;
  const promise = withBillingConfirmationLock(userId, async () => {
    const attempt = await readBillingAttempt(
      userId,
      payload.customerKey,
      payload.idempotencyKey,
    );
    if (attempt.resumedWithoutPayment) return fetchMySubscription();
    if (attempt.submitted) {
      let recovered: InitialPaymentResponseDto | undefined;
      try {
        recovered = await recoverInitialPayment(attempt.idempotencyKey);
      } catch (error) {
        if (!isNotFound(error)) throw error;
        await markBillingAttemptRetryable(userId, attempt);
        // 새로고침·결과 확인은 조회만 수행하고 명시적인 재시도만 승인합니다.
        if (action !== "retry") throw new BillingPaymentRetryableError();
      }
      if (recovered) return confirmedSubscription(recovered);
    } else if (action === "check") {
      return confirmedSubscription(
        await recoverInitialPayment(attempt.idempotencyKey),
      );
    }
    await markBillingAttemptSubmitted(userId, attempt);
    let result: InitialPaymentResponseDto;
    try {
      result = await confirmBillingAuth({
        ...payload,
        idempotencyKey: attempt.idempotencyKey,
        priceVersion: attempt.priceVersion,
      });
    } catch (error) {
      // 서버가 처리했지만 응답만 유실된 경우 동일한 시도를 조회합니다.
      try {
        result = await recoverInitialPayment(attempt.idempotencyKey);
      } catch (lookupError) {
        if (isNotFound(lookupError)) {
          if (error instanceof ApiError && [400, 409].includes(error.status)) {
            await clearActiveBillingAttempt(userId, attempt.idempotencyKey);
            throw new BillingPaymentFailedError();
          }
          await markBillingAttemptRetryable(userId, attempt);
          throw new BillingPaymentRetryableError();
        }
        throw error;
      }
    }
    if (result.status === "DONE" && result.attemptId === null) {
      await markBillingAttemptSubmitted(userId, {
        ...attempt,
        resumedWithoutPayment: true,
      });
    }
    return confirmedSubscription(result);
  });
  const entry = { promise, settled: false };
  confirmations.set(identity, entry);
  // 성공 결과는 재사용하고, 명시적인 재확인·재시도는 완료된 Promise를 교체합니다.
  void promise.then(
    () => {
      entry.settled = true;
    },
    () => {
      entry.settled = true;
    },
  );
  return promise;
};

export const recoverInitialPayment = async (idempotencyKey: string) => {
  const result = await fetchInitialPayment(idempotencyKey);
  if (result.status !== "PENDING") return result;
  return reconcileInitialPayment(idempotencyKey).catch(() => result);
};

// 다른 탭이나 이전 리다이렉트에서 제출한 결제가 미확정이면 새 결제 인증을 만들지 않습니다.
export const recoverActiveBilling = (userId: string) =>
  withBillingConfirmationLock(userId, async () => {
    const attempt = await readActiveBillingAttempt(userId);
    if (!attempt?.submitted) return null;
    let result: Pick<InitialPaymentResponseDto, "status">;
    try {
      result = attempt.resumedWithoutPayment
        ? { status: "DONE" }
        : await recoverInitialPayment(attempt.idempotencyKey);
    } catch (error) {
      if (!isNotFound(error)) throw error;
      await markBillingAttemptRetryable(userId, attempt);
      return null;
    }
    if (result.status === "PENDING")
      throw new BillingConfirmationAlreadySubmittedError();
    if (result.status === "DONE") {
      const current = await fetchMySubscription();
      if (hasEstimatedProAccess(current)) return current;
      await clearActiveBillingAttempt(userId, attempt.idempotencyKey);
      return null;
    }
    if (result.status === "FAILED" || result.status === "CANCELED") {
      await clearActiveBillingAttempt(userId, attempt.idempotencyKey);
      return null;
    }
    throw new BillingConfirmationAlreadySubmittedError();
  });
