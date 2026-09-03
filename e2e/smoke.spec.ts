import { expect, test } from "@playwright/test";

test("랜딩 페이지의 핵심 메시지와 단일 CTA를 렌더링한다", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /복사한 텍스트와 이미지를\s*한곳에 모아두세요\./,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "시작하기" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /무료로 시작하기|데모 보기|데모 다시 보기/ }),
  ).toHaveCount(0);
});
