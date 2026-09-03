import { expect, test } from "@playwright/test";

test("존재하지 않는 폴더는 재시도 없이 전용 오류 상태를 표시한다", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test-refresh-token",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  let clipRequestCount = 0;

  await page.route("**/users/me", (route) =>
    route.fulfill({
      json: {
        id: "user-1",
        displayName: "테스트 사용자",
        avatarUrl: null,
        authAccounts: [],
      },
    }),
  );
  await page.route("**/users/me/settings", (route) =>
    route.fulfill({
      json: {
        id: "settings-1",
        userId: "user-1",
        theme: "LIGHT",
        language: "ko",
      },
    }),
  );
  await page.route("**/folders", (route) => route.fulfill({ json: [] }));
  await page.route("**/clips?**", (route) => {
    clipRequestCount += 1;

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: "폴더를 찾을 수 없습니다." }),
    });
  });

  await page.goto("/folder/missing-folder");

  const folderNotFoundAlert = page
    .getByRole("alert")
    .filter({ hasText: "존재하지 않는 폴더입니다." });

  await expect(folderNotFoundAlert).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 시도" })).toHaveCount(
    0,
  );
  expect(clipRequestCount).toBe(1);
});
