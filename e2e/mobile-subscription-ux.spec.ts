import { expect, test } from "./fixtures";
import { setup, pro } from "./access-fixture";

test("권한 복귀 확인 중에도 기존 공개 콘텐츠를 유지한다", async ({ page }) => {
  await setup(page);
  await page.goto("/folder/a");
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
  let release!: () => void;
  let requested = false;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/subscriptions/me", async (route) => {
    requested = true;
    await gate;
    await route.fulfill({
      json: { ...pro, plan: "FREE", currentPeriodEnd: null },
    });
  });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => requested).toBe(true);
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "권한을 확인하고 있습니다" }),
  ).toHaveCount(0);
  release();
});

test("권한 복귀 확인 실패 시 기존 콘텐츠를 차단한다", async ({ page }) => {
  await setup(page);
  await page.goto("/folder/a");
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
  await page.route("**/subscriptions/me", (route) =>
    route.fulfill({ status: 500, json: { message: "error" } }),
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("heading", { name: "권한을 확인하지 못했습니다" }),
  ).toBeVisible();
  await expect(page.getByText("공개 클립", { exact: true })).toHaveCount(0);
});

test("설정에서 Free와 해지 예정 Pro 상태를 구분해 표시한다", async ({
  page,
}, testInfo) => {
  const state = await setup(page);
  await page.goto("/folder/a");
  await page.getByRole("button", { name: "사용자" }).click();
  await page.getByRole("button", { name: "설정", exact: true }).click();
  await expect(
    page.getByText("무료 플랜 이용 중", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("다음 결제", { exact: true })).toHaveCount(0);
  await testInfo.attach("free-subscription", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  state.subscription = {
    ...pro,
    status: "CANCELED",
    currentPeriodEnd: "2099-01-01T00:00:00Z",
    nextBillingAt: null,
  };
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "사용자" }).click();
  await page.getByRole("button", { name: "설정", exact: true }).click();
  await expect(page.getByText("PRO", { exact: true })).toBeVisible();
  await expect(page.getByText(/해지 예약.*2099.*까지 이용 가능/)).toBeVisible();
  await expect(page.getByText("다음 결제", { exact: true })).toHaveCount(0);
  await testInfo.attach("canceled-pro-subscription", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});

test("작은 모바일 뷰포트에서 사이드바 하단 메뉴가 보인다", async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/folder/a");
  await page.getByRole("button", { name: "사이드바 열기" }).click();
  const userButton = page.getByRole("button", { name: "사용자" });
  await expect(userButton).toBeVisible();
  const bounds = await userButton.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(600);
  await testInfo.attach("mobile-sidebar", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});
