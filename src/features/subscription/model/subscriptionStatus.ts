// 서버 DTO와 분리된 표시 상태입니다. 무료 플랜에는 유료 구독 상태가 없습니다.
export type SubscriptionStatus =
  | { kind: "free"; plan: "FREE" }
  | {
      kind: "active";
      plan: "PRO";
      currentPeriodEnd: string;
      autoRenew: boolean;
      nextBillingAt: string | null;
    }
  | { kind: "canceled"; plan: "PRO"; currentPeriodEnd: string }
  | { kind: "unavailable"; plan: null };
