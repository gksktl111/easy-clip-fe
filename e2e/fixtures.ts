import { test as base } from "@playwright/test";
export * from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route("**/subscriptions/me", (route) =>
      route.fulfill({
        json: {
          plan: "PRO",
          status: "ACTIVE",
          autoRenew: true,
          currentPeriodEnd: "2099-01-01T00:00:00Z",
          nextBillingAt: "2099-01-01T00:00:00Z",
          provider: "TOSS_PAYMENTS",
        },
      }),
    );
    await provide(page);
  },
});
