import { afterEach, expect, it, vi } from "vitest";
import { fetchSubscriptionPrice } from "./subscriptionApi";
const price = {
  plan: "PRO",
  amount: 5900,
  currency: "KRW",
  interval: "MONTH",
  intervalCount: 1,
  priceVersion: "v2",
};
afterEach(() => vi.unstubAllGlobals());
it("서버 금액·주기·가격 버전을 사용하고 인증 갱신을 요청하지 않는다", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(price));
  vi.stubGlobal("fetch", fetchMock);
  await expect(fetchSubscriptionPrice()).resolves.toEqual(price);
  expect(fetchMock.mock.calls[0][1]).toMatchObject({
    credentials: "omit",
    cache: "no-store",
  });
});
it.each([
  null,
  { ...price, amount: -1 },
  { ...price, amount: 1.5 },
  { ...price, currency: "USD" },
  { ...price, intervalCount: 12 },
  { ...price, priceVersion: "" },
])("잘못된 가격에는 표시 상수를 대신 반환하지 않는다: %j", async (value) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(value)));
  await expect(fetchSubscriptionPrice()).rejects.toThrow(
    "INVALID_SUBSCRIPTION_PRICE",
  );
});
