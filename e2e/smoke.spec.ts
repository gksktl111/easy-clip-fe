import { expect, test } from "@playwright/test";

test("랜딩 페이지를 렌더링한다", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /어디서든 복사하고\.\s*어디서나 붙여넣기\./,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "무료로 시작하기" }).first(),
  ).toBeVisible();
});
