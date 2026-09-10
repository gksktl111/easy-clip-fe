import { describe, expect, it } from "vitest";
import type { MySubscriptionResponseDto } from "../model/subscription.dto";
import { mapSubscriptionStatus } from "./mapSubscriptionStatus";

const now = Date.parse("2026-09-10T12:00:00Z");
const subscription: MySubscriptionResponseDto = {
  plan: "PRO",
  status: "ACTIVE",
  autoRenew: true,
  currentPeriodEnd: "2026-10-10T12:00:00Z",
  nextBillingAt: "2026-10-10T12:00:00Z",
  provider: "TOSS_PAYMENTS",
};

describe("표시용 구독 상태", () => {
  it.each(["ACTIVE", "CANCELED", "EXPIRED"] as const)(
    "FREE/%s에는 유료 구독 상태나 결제 날짜를 노출하지 않는다",
    (status) => {
      expect(
        mapSubscriptionStatus({ ...subscription, plan: "FREE", status }, now),
      ).toEqual({ kind: "free", plan: "FREE" });
    },
  );

  it("해지해도 남은 이용 기간에는 PRO와 종료일을 유지한다", () => {
    expect(
      mapSubscriptionStatus(
        { ...subscription, status: "CANCELED", autoRenew: false },
        now,
      ),
    ).toEqual({
      kind: "canceled",
      plan: "PRO",
      currentPeriodEnd: "2026-10-10T12:00:00.000Z",
    });
  });

  it.each(["ACTIVE", "CANCELED"] as const)(
    "%s라도 이용 기간이 끝나는 시각부터 Free로 표시한다",
    (status) => {
      expect(
        mapSubscriptionStatus(
          {
            ...subscription,
            status,
            currentPeriodEnd: new Date(now).toISOString(),
          },
          now,
        ),
      ).toEqual({ kind: "free", plan: "FREE" });
    },
  );

  it("서버가 만료 상태를 반환하면 미래 날짜가 남아도 Pro로 표시하지 않는다", () => {
    expect(
      mapSubscriptionStatus({ ...subscription, status: "EXPIRED" }, now),
    ).toEqual({ kind: "free", plan: "FREE" });
  });

  it.each([null, "invalid"])("종료일 %s는 무료로 단정하지 않는다", (end) => {
    expect(
      mapSubscriptionStatus({ ...subscription, currentPeriodEnd: end }, now),
    ).toEqual({ kind: "unavailable", plan: null });
  });

  it("응답을 받지 못한 상태는 Free와 구분한다", () => {
    expect(mapSubscriptionStatus(null, now)).toEqual({
      kind: "unavailable",
      plan: null,
    });
  });

  it("유효한 자동 갱신 구독만 다음 결제일을 표시한다", () => {
    expect(mapSubscriptionStatus(subscription, now)).toEqual({
      kind: "active",
      plan: "PRO",
      currentPeriodEnd: "2026-10-10T12:00:00.000Z",
      autoRenew: true,
      nextBillingAt: "2026-10-10T12:00:00.000Z",
    });
    expect(
      mapSubscriptionStatus({ ...subscription, autoRenew: false }, now),
    ).toMatchObject({ kind: "active", nextBillingAt: null });
    expect(
      mapSubscriptionStatus({ ...subscription, nextBillingAt: "invalid" }, now),
    ).toMatchObject({ kind: "active", nextBillingAt: null });
  });
});
