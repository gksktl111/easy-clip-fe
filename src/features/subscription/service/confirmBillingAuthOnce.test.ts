import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { confirm, lookup, subscription, reconcile } = vi.hoisted(() => ({
  confirm: vi.fn(),
  lookup: vi.fn(),
  subscription: vi.fn(),
  reconcile: vi.fn(),
}));
vi.mock("../api/subscriptionApi", () => ({
  confirmBillingAuth: confirm,
  fetchInitialPayment: lookup,
  fetchMySubscription: subscription,
  reconcileInitialPayment: reconcile,
}));
const payload = {
  authKey: "test-auth",
  customerKey: "test-customer",
  idempotencyKey: "",
};
const price = {
  plan: "PRO",
  amount: 4900,
  currency: "KRW",
  interval: "MONTH",
  intervalCount: 1,
  priceVersion: "v1",
} as const;
const pro = { plan: "PRO", status: "ACTIVE" };
beforeEach(async () => {
  vi.resetModules();
  confirm.mockReset();
  lookup.mockReset();
  subscription.mockReset();
  subscription.mockResolvedValue(pro);
  reconcile.mockReset();
  reconcile.mockResolvedValue({ status: "PENDING" });
  const stored = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
    removeItem: (key: string) => stored.delete(key),
  });
  vi.stubGlobal("navigator", {
    locks: {
      request: async (_key: string, callback: () => Promise<unknown>) =>
        callback(),
    },
  });
  const { prepareBillingAttempt } = await import("./billingAttempt");
  const attempt = await prepareBillingAttempt(
    "user",
    payload.customerKey,
    price,
  );
  payload.idempotencyKey = attempt.idempotencyKey;
});
afterEach(() => vi.unstubAllGlobals());
describe("결제 멱등키와 결과 복구", () => {
  it("동시 호출은 동일한 승인 요청을 공유하며 가격 버전과 UUID를 전송한다", async () => {
    confirm.mockResolvedValue({ status: "DONE", subscription: pro });
    const { confirmBillingAuthOnce } = await import("./confirmBillingAuthOnce");
    const first = confirmBillingAuthOnce("user", payload);
    expect(confirmBillingAuthOnce("user", payload)).toBe(first);
    await expect(first).resolves.toEqual(pro);
    expect(confirm).toHaveBeenCalledExactlyOnceWith({
      ...payload,
      priceVersion: "v1",
      idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/),
    });
  });
  it("응답 유실은 같은 멱등키 조회로 복구하고 새로고침에도 재청구하지 않는다", async () => {
    confirm.mockRejectedValue(new TypeError("Failed to fetch"));
    lookup.mockResolvedValue({ status: "DONE" });
    subscription.mockResolvedValue(pro);
    const first = await import("./confirmBillingAuthOnce");
    await expect(
      first.confirmBillingAuthOnce("user", payload),
    ).resolves.toEqual(pro);
    const key = confirm.mock.calls[0][0].idempotencyKey;
    expect(lookup).toHaveBeenCalledWith(key);
    vi.resetModules();
    const reloaded = await import("./confirmBillingAuthOnce");
    await expect(
      reloaded.confirmBillingAuthOnce("user", payload),
    ).resolves.toEqual(pro);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(lookup).toHaveBeenLastCalledWith(key);
  });
  it("PENDING은 구독이 PRO라도 결제 성공으로 표시하지 않는다", async () => {
    confirm.mockResolvedValue({ status: "PENDING", subscription: pro });
    const { confirmBillingAuthOnce, BillingConfirmationAlreadySubmittedError } =
      await import("./confirmBillingAuthOnce");
    await expect(
      confirmBillingAuthOnce("user", payload),
    ).rejects.toBeInstanceOf(BillingConfirmationAlreadySubmittedError);
    expect(subscription).not.toHaveBeenCalled();
  });
  it("확정 실패를 결과 불명확 상태와 구분한다", async () => {
    confirm.mockResolvedValue({ status: "FAILED" });
    const { confirmBillingAuthOnce, BillingPaymentFailedError } =
      await import("./confirmBillingAuthOnce");
    await expect(
      confirmBillingAuthOnce("user", payload),
    ).rejects.toBeInstanceOf(BillingPaymentFailedError);
  });
  it("다른 사용자나 저장 실패에는 승인 요청을 보내지 않는다", async () => {
    const { confirmBillingAuthOnce } = await import("./confirmBillingAuthOnce");
    await expect(confirmBillingAuthOnce("other-user", payload)).rejects.toThrow(
      "BILLING_ATTEMPT_MISSING",
    );
    const getItem = localStorage.getItem;
    vi.stubGlobal("localStorage", {
      getItem,
      setItem: () => {
        throw new Error("Storage unavailable");
      },
    });
    await expect(confirmBillingAuthOnce("user", payload)).rejects.toThrow(
      "Storage unavailable",
    );
    expect(confirm).not.toHaveBeenCalled();
  });
});

it("다른 탭의 같은 흐름은 키를 재사용하고 표시 가격 변경은 이전 기록을 보존한다", async () => {
  const { prepareBillingAttempt, readBillingAttempt } =
    await import("./billingAttempt");
  const same = await prepareBillingAttempt("user", payload.customerKey, price);
  expect(same.idempotencyKey).toBe(payload.idempotencyKey);
  const changed = await prepareBillingAttempt("user", payload.customerKey, {
    ...price,
    priceVersion: "v2",
  });
  expect(changed.idempotencyKey).not.toBe(payload.idempotencyKey);
  await expect(
    readBillingAttempt("user", payload.customerKey, payload.idempotencyKey),
  ).resolves.toMatchObject({ priceVersion: "v1" });
});

it("미확정 결제는 대사하고 신규 키 생성을 막으며 확인된 실패만 새 흐름을 허용한다", async () => {
  confirm.mockResolvedValue({ status: "PENDING" });
  lookup.mockResolvedValue({ status: "PENDING" });
  const {
    confirmBillingAuthOnce,
    recoverActiveBilling,
    BillingConfirmationAlreadySubmittedError,
  } = await import("./confirmBillingAuthOnce");
  await expect(confirmBillingAuthOnce("user", payload)).rejects.toBeInstanceOf(
    BillingConfirmationAlreadySubmittedError,
  );
  await expect(recoverActiveBilling("user")).rejects.toBeInstanceOf(
    BillingConfirmationAlreadySubmittedError,
  );
  expect(reconcile).toHaveBeenCalledWith(payload.idempotencyKey);
  const { prepareBillingAttempt } = await import("./billingAttempt");
  await expect(
    prepareBillingAttempt("user", payload.customerKey, price),
  ).rejects.toThrow("BILLING_ATTEMPT_PENDING");
  lookup.mockResolvedValue({ status: "FAILED" });
  await expect(recoverActiveBilling("user")).resolves.toBeNull();
  const next = await prepareBillingAttempt("user", payload.customerKey, price);
  expect(next.idempotencyKey).not.toBe(payload.idempotencyKey);
});

it("즉시 청구 없는 재개는 새로고침에도 결제 시도 조회 없이 최신 구독을 조회한다", async () => {
  confirm.mockResolvedValue({
    status: "DONE",
    attemptId: null,
    subscription: pro,
  });
  const first = await import("./confirmBillingAuthOnce");
  await expect(first.confirmBillingAuthOnce("user", payload)).resolves.toEqual(
    pro,
  );
  vi.resetModules();
  const reloaded = await import("./confirmBillingAuthOnce");
  await expect(
    reloaded.confirmBillingAuthOnce("user", payload),
  ).resolves.toEqual(pro);
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(lookup).not.toHaveBeenCalled();
  expect(subscription).toHaveBeenCalledTimes(2);
});
