import { expect, test } from "@playwright/test";

const pricingLocales = [
  {
    locale: "ko",
    heading: /작업 방식에 맞는\s*EasyClip 플랜을 선택하세요\./,
    proCta: "Pro로 업그레이드",
    comparisonTitle: "핵심 비교",
  },
  {
    locale: "en",
    heading: /Choose the EasyClip plan\s*that fits how you work\./,
    proCta: "Upgrade to Pro",
    comparisonTitle: "Compare the essentials",
  },
  {
    locale: "ja",
    heading: /あなたの働き方に合う\s*EasyClipプランを選びましょう。/,
    proCta: "Proにアップグレード",
    comparisonTitle: "主な違いを比較",
  },
  {
    locale: "zh",
    heading: /选择适合你的\s*EasyClip 套餐。/,
    proCta: "升级到 Pro",
    comparisonTitle: "核心功能比较",
  },
] as const;

for (const pricingLocale of pricingLocales) {
  test(`요금제 페이지를 ${pricingLocale.locale} 언어로 가로 넘침 없이 렌더링한다`, async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "easy_clip_language",
        value: pricingLocale.locale,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    await page.goto("/pricing");

    await expect(
      page.getByRole("heading", { name: pricingLocale.heading }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: pricingLocale.proCta }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: pricingLocale.comparisonTitle }),
    ).toBeVisible();

    const hasHorizontalOverflow = await page
      .locator("html")
      .evaluate((element) => element.scrollWidth > element.clientWidth);

    expect(hasHorizontalOverflow).toBe(false);
  });
}
