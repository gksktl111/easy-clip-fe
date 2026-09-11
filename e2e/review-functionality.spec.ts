import { test, expect } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

for (const failure of ["none", "network", "server"] as const) {
  test(`로그아웃 ${failure}: 성공 판정·실패 후 새로고침·재시도`, async ({
    page,
  }) => {
    await setup(page, true);
    let shouldFail = failure !== "none";
    let calls = 0;
    await page.route("**/auth/logout", async (route) => {
      calls++;
      if (shouldFail) {
        if (failure === "network") return route.abort("failed");
        return route.fulfill({ status: 500, json: { message: "failed" } });
      }
      await page.context().clearCookies({ name: "easy_clip_refresh_token" });
      return route.fulfill({ json: { success: true } });
    });
    await page.goto("/folder/a");
    await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "사용 사용자", exact: true })
      .click();
    await page
      .getByRole("button", { name: ko.sidebar.logout, exact: true })
      .click();

    if (shouldFail) {
      await expect(page.locator("main").getByRole("alert")).toContainText(
        ko.authGuard.logoutFailed,
      );
      await expect(page.getByText("공개 클립", { exact: true })).toHaveCount(0);
      await expect(page.locator("[data-sonner-toast]")).not.toContainText(
        ko.feedback.loggedOut,
      );
      await page.reload();
      await expect(page.locator("main").getByRole("alert")).toContainText(
        ko.authGuard.logoutFailed,
      );
      await expect(page.getByText("공개 클립", { exact: true })).toHaveCount(0);
      expect(calls).toBe(1);
      shouldFail = false;
      await page
        .getByRole("button", { name: ko.authGuard.retryLogout })
        .click();
    }
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("[data-sonner-toast]")).toContainText(
      ko.feedback.loggedOut,
    );
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("link", { name: ko.login.contact }),
    ).toHaveAttribute("href", "mailto:medic6655@gmail.com");
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    expect(calls).toBe(failure === "none" ? 1 : 2);
  });
}

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  test(`${locale} 결제는 현재 혜택·월간 갱신·버튼을 같은 언어로 표시`, async ({
    page,
  }) => {
    await setup(page, false, locale);
    await page.goto("/billing");
    await expect(
      page.getByRole("heading", { name: messages.billing.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: messages.billing.start }),
    ).toBeVisible();
    await expect(
      page.getByText(messages.billing.renewal, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(messages.pricing.plans.pro.features.devices, {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText(messages.pricing.plans.pro.features.ai, { exact: true }),
    ).toHaveCount(0);
  });
}
