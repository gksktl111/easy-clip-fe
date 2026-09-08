import { expect, test } from "./fixtures";

test.use({ viewport: { width: 390, height: 844 } });

const locales = [
  ["ko", "페이지를 찾을 수 없습니다", "홈으로", "클립으로 이동"],
  ["en", "Page not found", "Go home", "Go to clips"],
  ["ja", "ページが見つかりません", "ホームへ", "クリップへ"],
  ["zh", "找不到页面", "返回首页", "前往剪辑"],
] as const;

for (const [locale, title, home, clips] of locales) {
  test(`${locale} 비로그인 오타 URL에서 404와 키보드 탐색 제공`, async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "easy_clip_language",
        value: locale,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveURL(/\/does-not-exist$/);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    expect(
      await page
        .locator("html")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    if (locale === "ko") {
      await page.screenshot({ path: test.info().outputPath("404-light.png") });
      await page.locator("html").evaluate((el) => {
        el.dataset.theme = "dark";
      });
      await page.screenshot({ path: test.info().outputPath("404-dark.png") });
      await page.locator("html").evaluate((el) => {
        el.dataset.theme = "light";
      });
    }
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: home, exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: clips, exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/does-not-exist");
    await page.getByRole("link", { name: home, exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test("인증된 사용자의 미등록 하위 경로도 404이며 클립 화면으로 복귀한다", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test-token",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.route("**/users/me", (route) =>
    route.fulfill({
      json: {
        id: "user-1",
        displayName: "사용자",
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
  await page.route("**/clips?**", (route) =>
    route.fulfill({ json: { items: [], hasMore: false, nextCursor: null } }),
  );
  for (const path of [
    "/billing/missing",
    "/folder/id/missing",
    "/favorites/missing",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" }),
    ).toBeVisible();
  }
  await page.getByRole("link", { name: "클립으로 이동" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(
    page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" }),
  ).toHaveCount(0);
  await page.route("**/folders", (route) => route.fulfill({ json: [
    { id: "empty", name: "빈 폴더", order: 0, isLocked: false },
    { id: "error", name: "오류 폴더", order: 1, isLocked: false },
  ] }));
  await page.goto("/folder/empty");
  await expect(
    page.getByText("아직 저장된 클립이 없습니다", { exact: true }),
  ).toBeVisible();
  await page.route("**/clips?**", (route) =>
    route.fulfill({ status: 500, json: { message: "서버 오류" } }),
  );
  await page.goto("/folder/error");
  await expect(
    page.getByText("클립을 불러오지 못했습니다", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" }),
  ).toHaveCount(0);
});
