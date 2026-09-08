import { describe, expect, it } from "vitest";
import { hasEstimatedProAccess } from "./subscriptionPolicy";
import type { MySubscriptionResponseDto } from "../model/subscription.dto";

const now = Date.parse("2026-09-08T12:00:00Z");
const subscription: MySubscriptionResponseDto = {
  plan: "PRO",
  status: "ACTIVE",
  autoRenew: true,
  currentPeriodEnd: "2026-09-09T12:00:00Z",
  nextBillingAt: null,
  provider: "TOSS_PAYMENTS",
};

describe("유효 Pro 안내", () => {
  it("ACTIVE와 잔여 기간 CANCELED만 유효하며 자동갱신 여부는 권한이 아니다", () => {
    expect(hasEstimatedProAccess(subscription, now)).toBe(true);
    expect(
      hasEstimatedProAccess(
        { ...subscription, status: "CANCELED", autoRenew: false },
        now,
      ),
    ).toBe(true);
    expect(
      hasEstimatedProAccess({ ...subscription, status: "EXPIRED" }, now),
    ).toBe(false);
    expect(hasEstimatedProAccess({ ...subscription, plan: "FREE" }, now)).toBe(
      false,
    );
  });
  it.each([
    null,
    "invalid",
    "2026-09-08T12:00:00Z",
    "2026-09-08T20:59:59+09:00",
  ])("만료 또는 불명확한 종료일 %s는 Pro로 간주하지 않는다", (end) => {
    expect(
      hasEstimatedProAccess({ ...subscription, currentPeriodEnd: end }, now),
    ).toBe(false);
  });
});
