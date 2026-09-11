import { expect, test } from "./fixtures";
import { setup, pro } from "./access-fixture";
import ko from "../src/messages/ko.json";

for (const pendingRenewalPayment of [true, false]) {
  test(`해지 응답의 서버 안내와 진행 중 청구(${pendingRenewalPayment})를 표시하고 남은 Pro 권한을 유지한다`, async ({
    page,
  }) => {
    const state = await setup(page, true);
    let updates = 0;
    let folderReads = 0;
    await page.route("**/folders", (route) => {
      folderReads++;
      return route.fulfill({ json: state.folders });
    });
    await page.route("**/subscriptions/me", (route) => {
      if (route.request().method() === "PATCH") {
        expect(route.request().postDataJSON()).toEqual({ type: "CANCEL" });
        updates++;
        state.subscription = { ...pro, status: "CANCELED", autoRenew: false };
        return route.fulfill({
          json: {
            ...state.subscription,
            cancellation: {
              message: "서버 해지 안내 검증",
              pendingRenewalPayment,
            },
          },
        });
      }
      return route.fulfill({ json: state.subscription });
    });
    await page.goto("/pricing");
    await page
      .getByRole("button", { name: ko.pricing.subscription.downgrade })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "예", exact: true })
      .click();
    await expect(
      page.getByText("서버 해지 안내 검증", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(ko.pricing.subscription.pendingRenewalPayment, {
        exact: true,
      }),
    ).toHaveCount(pendingRenewalPayment ? 1 : 0);
    await expect(page.getByText("비공개 클립", { exact: true })).toBeVisible();
    expect(updates).toBe(1);
    expect(folderReads).toBeGreaterThanOrEqual(2);
  });
}

test("confirm 완료 후 폴더를 다시 확인해야 콘텐츠가 열리고 화면 재진입·새로고침은 재청구하지 않는다", async ({
  page,
}) => {
  const state = await setup(page);
  let confirms = 0;
  let postConfirmReads = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/folders", async (route) => {
    if (confirms) {
      postConfirmReads++;
      await gate;
    }
    await route.fulfill({ json: state.folders });
  });
  await page.route("**/subscriptions/me/billing-auth/confirm", (route) => {
    confirms++;
    expect(route.request().postDataJSON()).toEqual({
      authKey: "mock-auth",
      customerKey: "mock-customer",
    });
    state.subscription = { ...pro };
    state.folders[1].isLocked = false;
    return route.fulfill({ status: 201, json: pro });
  });
  const url = "/billing/success?authKey=mock-auth&customerKey=mock-customer";
  await page.goto(url);
  await expect(
    page.getByText(ko.access.billingSuccess, { exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-sonner-toast]")).toContainText(
    ko.feedback.billingConfirmed,
  );
  await page.getByRole("link", { name: ko.access.openApp }).click();
  await expect(
    page.getByRole("status", { name: ko.access.checkingTitle }),
  ).toBeVisible();
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
  release();
  await expect(page.getByText("비공개 클립", { exact: true })).toBeVisible();
  expect(postConfirmReads).toBeGreaterThan(0);
  await page.goto(url);
  await expect(
    page.getByText(ko.access.billingUncertain, { exact: false }),
  ).toBeVisible();
  expect(confirms).toBe(1);
});

for (const failure of ["network", "conflict"] as const) {
  test(`confirm ${failure} 오류는 서버 메시지·불명확 안내를 표시하고 자동 재전송하지 않는다`, async ({
    page,
  }) => {
    await setup(page);
    let confirms = 0;
    let subscriptionReads = 0;
    await page.route("**/subscriptions/me", async (route) => {
      subscriptionReads++;
      await route.fallback();
    });
    await page.route("**/subscriptions/me/billing-auth/confirm", (route) => {
      confirms++;
      return failure === "network"
        ? route.abort("failed")
        : route.fulfill({
            status: 409,
            json: { message: "이전 결제 결과 확인 중" },
          });
    });
    await page.goto(
      "/billing/success?authKey=mock-failure&customerKey=mock-customer",
    );
    await expect(
      page.getByText(ko.access.billingUncertain, { exact: false }),
    ).toBeVisible();
    await expect(page.locator("[data-sonner-toast]")).toContainText(
      ko.feedback.billingFailed,
    );
    if (failure === "conflict")
      await expect(
        page.getByText("이전 결제 결과 확인 중", { exact: false }),
      ).toBeVisible();
    await expect.poll(() => subscriptionReads).toBeGreaterThan(0);
    await page.reload();
    await expect(
      page.getByText(ko.access.billingUncertain, { exact: false }),
    ).toBeVisible();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
    expect(confirms).toBe(1);
  });
}

test("구독 재개의 일반 409는 서버 메시지를 표시하며 신규 결제를 자동 시작하지 않는다", async ({
  page,
}) => {
  const state = await setup(page, true);
  state.subscription = { ...pro, status: "CANCELED", autoRenew: false };
  let resumes = 0;
  await page.route("**/subscriptions/me", (route) => {
    if (route.request().method() === "PATCH") {
      resumes++;
      expect(route.request().postDataJSON()).toEqual({ type: "RESUME" });
      return route.fulfill({
        status: 409,
        json: { message: "저장된 결제수단을 확인해주세요" },
      });
    }
    return route.fulfill({ json: state.subscription });
  });
  await page.goto("/pricing");
  await page
    .getByRole("button", { name: ko.pricing.subscription.resume, exact: true })
    .click();
  await expect(
    page.getByText("저장된 결제수단을 확인해주세요", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/pricing$/);
  expect(resumes).toBe(1);
});
