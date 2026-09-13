import { expect, test } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";
const price = {
  plan: "PRO",
  amount: 5900,
  currency: "KRW",
  interval: "MONTH",
  intervalCount: 1,
  priceVersion: "price-5900",
};

test("서버 가격을 가격표와 결제에 표시하고 조회 실패에는 결제를 차단한다", async ({
  page,
}) => {
  await setup(page);
  let fail = false;
  await page.route("**/subscriptions/pricing", (route) =>
    fail
      ? route.fulfill({ status: 503, json: { message: "unavailable" } })
      : route.fulfill({ json: price }),
  );
  await page.goto("/pricing");
  await expect(page.getByText("₩5,900", { exact: true })).toBeVisible();
  await page.goto("/billing");
  await expect(page.getByText("₩5,900", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: ko.billing.start, exact: true }),
  ).toBeEnabled();
  fail = true;
  await page.reload();
  await expect(page.getByText(ko.subscriptionPrice.error)).toBeVisible();
  await expect(
    page.getByRole("button", { name: ko.billing.start, exact: true }),
  ).toBeDisabled();
  await expect(page.getByText(/₩[\d,]+/)).toHaveCount(0);
  fail = false;
  await page
    .getByRole("button", { name: ko.subscriptionPrice.retry, exact: true })
    .click();
  await expect(page.getByText("₩5,900", { exact: true })).toBeVisible();
});

test("카드 인증 시작 전 가격이 바뀌면 새 가격을 표시하고 다시 확인받는다", async ({
  page,
}) => {
  await setup(page);
  let currentPrice = price;
  let starts = 0;
  await page.route("**/subscriptions/pricing", (route) =>
    route.fulfill({ json: currentPrice }),
  );
  await page.route("**/subscriptions/me/billing-auth/request", (route) => {
    starts++;
    expect(route.request().headers()["x-csrf-protection"]).toBe("1");
    currentPrice = { ...price, amount: 6900, priceVersion: "price-6900" };
    return route.fulfill({
      json: {
        price: currentPrice,
        customerKey: "test-customer",
        clientKey: "test_ck_mock",
        method: "CARD",
        successUrl: "http://127.0.0.1:3107/billing/success",
        failUrl: "http://127.0.0.1:3107/billing/fail",
      },
    });
  });
  let sdkLoads = 0;
  await page.route("https://js.tosspayments.com/**", (route) => {
    sdkLoads++;
    return route.abort();
  });
  await page.goto("/billing");
  await page
    .getByRole("button", { name: ko.billing.start, exact: true })
    .click();
  await expect(page.getByText(ko.subscriptionPrice.changed)).toBeVisible();
  await expect(page.getByText("₩6,900", { exact: true })).toBeVisible();
  expect(starts).toBe(1);
  expect(sdkLoads).toBe(0);
});

test("표시 가격을 확인한 카드 인증은 같은 가격 버전·멱등키로 승인하고 재진입에는 결과만 조회한다", async ({
  page,
}) => {
  const state = await setup(page);
  await page.route("**/subscriptions/pricing", (route) =>
    route.fulfill({ json: price }),
  );
  await page.route("**/subscriptions/me/billing-auth/request", (route) =>
    route.fulfill({
      json: {
        price,
        customerKey: "checkout-customer",
        clientKey: "test_ck_mock",
        method: "CARD",
        successUrl: "http://127.0.0.1:3107/billing/success",
        failUrl: "http://127.0.0.1:3107/billing/fail",
      },
    }),
  );
  await page.addInitScript(() => {
    Object.defineProperty(window, "TossPayments", {
      value: () => ({
        requestBillingAuth: async (
          _method: string,
          options: { successUrl: string; customerKey: string },
        ) => {
          const url = new URL(options.successUrl);
          url.searchParams.set("authKey", "checkout-auth");
          url.searchParams.set("customerKey", options.customerKey);
          window.location.assign(url.toString());
        },
      }),
    });
  });
  let confirms = 0;
  let paymentKey = "";
  const subscription = {
    plan: "PRO",
    status: "ACTIVE",
    autoRenew: true,
    currentPeriodEnd: "2099-01-01T00:00:00Z",
    nextBillingAt: null,
    provider: "TOSS_PAYMENTS",
  };
  await page.route("**/subscriptions/me/billing-auth/confirm", (route) => {
    confirms++;
    const body = route.request().postDataJSON();
    expect(body).toMatchObject({
      authKey: "checkout-auth",
      customerKey: "checkout-customer",
      priceVersion: price.priceVersion,
    });
    expect(body.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    paymentKey = body.idempotencyKey;
    state.subscription = subscription;
    return route.fulfill({ json: { status: "DONE", subscription } });
  });
  let lookups = 0;
  await page.route("**/subscriptions/me/billing/payments/*", (route) => {
    lookups++;
    expect(route.request().url()).toContain(paymentKey);
    return route.fulfill({ json: { status: "DONE", subscription } });
  });
  await page.goto("/billing");
  await page
    .getByRole("button", { name: ko.billing.start, exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: ko.access.billingCompleteTitle }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: ko.access.billingCompleteTitle }),
  ).toBeVisible();
  expect(confirms).toBe(1);
  expect(lookups).toBe(1);
});
