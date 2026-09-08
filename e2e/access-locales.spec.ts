import { expect, test } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  test(`${locale} 잠금 안내와 요금제 한도는 작은 화면에서도 번역·키보드 이동을 유지한다`, async ({
    page,
  }) => {
    await setup(page, false, locale);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/folder/b");
    await expect(
      page.getByRole("heading", { name: messages.access.lockedTitle }),
    ).toBeVisible();
    const retry = page.getByRole("button", {
      name: messages.access.retry,
      exact: true,
    });
    await retry.focus();
    await expect(
      page
        .getByRole("link", { name: messages.access.plans, exact: true })
        .locator("span"),
    ).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(retry).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: messages.access.plans, exact: true }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Enter");
    await expect(
      page
        .getByText(messages.pricing.plans.pro.features.clips, { exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(messages.access.clipLimitExplanation, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/500/)).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
