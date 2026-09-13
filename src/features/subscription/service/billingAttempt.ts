import type { SubscriptionPriceResponseDto } from "../model/subscription.dto";

export interface BillingAttempt {
  idempotencyKey: string;
  priceVersion: string;
  customerHash: string;
  submitted: boolean;
  resumedWithoutPayment?: boolean;
}
const digest = async (value: string) => {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(hash), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
};
const userKey = async (userId: string) =>
  `billing-attempt:${await digest(userId)}`;
const parseAttempt = (raw: string | null): BillingAttempt => {
  if (!raw) throw new Error("BILLING_ATTEMPT_MISSING");
  const attempt = JSON.parse(raw) as BillingAttempt;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      attempt.idempotencyKey,
    ) ||
    typeof attempt.priceVersion !== "string" ||
    !attempt.priceVersion ||
    typeof attempt.customerHash !== "string" ||
    typeof attempt.submitted !== "boolean"
  )
    throw new Error("BILLING_ATTEMPT_INVALID");
  return attempt;
};

export const prepareBillingAttempt = async (
  userId: string,
  customerKey: string,
  price: SubscriptionPriceResponseDto,
) => {
  const prefix = await userKey(userId);
  const customerHash = await digest(customerKey);
  // 같은 사용자·흐름을 여러 탭에서 시작해도 하나의 멱등키를 공유합니다.
  return navigator.locks.request(prefix, async () => {
    const active = await readActiveBillingAttempt(userId);
    if (active?.submitted) throw new Error("BILLING_ATTEMPT_PENDING");
    if (
      active &&
      active.customerHash === customerHash &&
      active.priceVersion === price.priceVersion
    )
      return active;
    const attempt: BillingAttempt = {
      idempotencyKey: crypto.randomUUID(),
      priceVersion: price.priceVersion,
      customerHash,
      submitted: false,
    };
    localStorage.setItem(
      `${prefix}:${attempt.idempotencyKey}`,
      JSON.stringify(attempt),
    );
    localStorage.setItem(`${prefix}:active`, attempt.idempotencyKey);
    return attempt;
  });
};
export const readBillingAttempt = async (
  userId: string,
  customerKey: string,
  idempotencyKey: string,
): Promise<BillingAttempt> => {
  const attempt = parseAttempt(
    localStorage.getItem(`${await userKey(userId)}:${idempotencyKey}`),
  );
  if (
    attempt.idempotencyKey !== idempotencyKey ||
    attempt.customerHash !== (await digest(customerKey))
  )
    throw new Error("BILLING_ATTEMPT_INVALID");
  return attempt;
};
export const markBillingAttemptSubmitted = async (
  userId: string,
  attempt: BillingAttempt,
) => {
  const prefix = await userKey(userId);
  await navigator.locks.request(prefix, async () => {
    const active = await readActiveBillingAttempt(userId);
    if (active?.submitted && active.idempotencyKey !== attempt.idempotencyKey)
      throw new Error("BILLING_ATTEMPT_PENDING");
    localStorage.setItem(
      `${prefix}:${attempt.idempotencyKey}`,
      JSON.stringify({ ...attempt, submitted: true }),
    );
    localStorage.setItem(`${prefix}:active`, attempt.idempotencyKey);
  });
};
export const readActiveBillingAttempt = async (
  userId: string,
): Promise<BillingAttempt | null> => {
  const prefix = await userKey(userId);
  const id = localStorage.getItem(`${prefix}:active`);
  return id ? parseAttempt(localStorage.getItem(`${prefix}:${id}`)) : null;
};
export const clearActiveBillingAttempt = async (
  userId: string,
  idempotencyKey: string,
) => {
  const key = `${await userKey(userId)}:active`;
  if (localStorage.getItem(key) === idempotencyKey)
    localStorage.removeItem(key);
};
