import { expect, test } from "./fixtures";
import { setup, pro } from "./access-fixture";
import { prepareBillingRedirect } from "./billing-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

const successUrl =
  "/billing/success?authKey=retry-auth&customerKey=retry-customer&paymentAttempt=12345678-1234-4123-8123-123456789012";

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  test(`${locale} 404 이후 새로고침은 조회만 하고 명시적인 결제 재시도는 같은 키로 처리한다`, async ({
    page,
  }) => {
    const state = await setup(page, false, locale);
    await prepareBillingRedirect(page, "retry-customer");
    await page.route("**/subscriptions/me/billing/payments/*", (route) =>
      route.fulfill({ status: 404, json: { message: "Not found" } }),
    );
    const payloads: unknown[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      "**/subscriptions/me/billing-auth/confirm",
      async (route) => {
        payloads.push(route.request().postDataJSON());
        if (payloads.length === 1) return route.abort("failed");
        await gate;
        state.subscription = { ...pro };
        await route.fulfill({
          json: { status: "DONE", attemptId: "retry-attempt" },
        });
      },
    );
    await page.goto(successUrl);
    await expect(
      page.getByText(messages.billingResult.retryable, { exact: true }),
    ).toBeVisible();
    expect(payloads).toHaveLength(1);
    await page.reload();
    const retry = page.getByRole("button", {
      name: messages.billingResult.retry,
      exact: true,
    });
    await expect(retry).toBeEnabled();
    expect(payloads).toHaveLength(1);
    await retry.click();
    await expect(
      page.getByRole("button", {
        name: messages.billingResult.processing,
        exact: true,
      }),
    ).toBeDisabled();
    await expect.poll(() => payloads.length).toBe(2);
    expect(payloads[1]).toEqual(payloads[0]);
    release();
    await expect(
      page.getByRole("heading", { name: messages.access.billingCompleteTitle }),
    ).toBeVisible();
  });
}

test("처리 중에는 결과 확인만 수행하고 완료되면 승인 요청 없이 성공 화면을 표시한다", async ({
  page,
}) => {
  const state = await setup(page);
  await prepareBillingRedirect(page, "retry-customer");
  let posts = 0;
  let status = "PENDING";
  await page.route("**/subscriptions/me/billing-auth/confirm", (route) => {
    posts++;
    return route.fulfill({ json: { status, attemptId: "pending-attempt" } });
  });
  await page.route("**/subscriptions/me/billing/payments/**", (route) =>
    route.fulfill({ json: { status, attemptId: "pending-attempt" } }),
  );
  await page.goto(successUrl);
  await expect(
    page.getByText(ko.billingResult.pending, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: ko.billingResult.retry, exact: true }),
  ).toHaveCount(0);
  const check = page.getByRole("button", {
    name: ko.billingResult.check,
    exact: true,
  });
  await check.click();
  await expect(check).toBeEnabled();
  expect(posts).toBe(1);
  status = "DONE";
  state.subscription = { ...pro };
  await check.click();
  await expect(
    page.getByRole("heading", { name: ko.access.billingCompleteTitle }),
  ).toBeVisible();
  expect(posts).toBe(1);
});

test("확정 실패에는 결제 화면으로 이동하는 버튼을 표시한다", async ({
  page,
}) => {
  await setup(page);
  await prepareBillingRedirect(page, "retry-customer");
  await page.route("**/subscriptions/me/billing-auth/confirm", (route) =>
    route.fulfill({ json: { status: "FAILED", attemptId: "failed-attempt" } }),
  );
  await page.goto(successUrl);
  await expect(
    page.getByText(ko.billingResult.failed, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: ko.billingResult.backToBilling }),
  ).toHaveAttribute("href", "/billing");
  await expect(
    page.getByRole("button", { name: ko.billingResult.retry, exact: true }),
  ).toHaveCount(0);
});
