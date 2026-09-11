import { test, expect } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";

for (const path of ["/folder/a", "/recent", "/favorites", "/trash"]) {
  test(`${path} 최초 진입과 새로고침은 권한 확인 전 스켈레톤만 표시한다`, async ({
    page,
  }, testInfo) => {
    const state = await setup(page);
    await page.setViewportSize({ width: 390, height: 844 });
    let contentReads = 0;
    await page.route("**/clips?**", (route) => {
      contentReads++;
      return route.fallback();
    });
    await page.route("**/trash?**", (route) => {
      if (new URL(route.request().url()).searchParams.has("_rsc"))
        return route.fallback();
      contentReads++;
      return route.fulfill({
        json: {
          items: [
            {
              itemType: "FOLDER",
              id: "deleted",
              name: "삭제된 자료",
              deletedAt: null,
            },
          ],
          nextCursor: null,
          hasNextPage: false,
        },
      });
    });
    let release!: () => void;
    let gate: Promise<void>;
    await page.route("**/folders", async (route) => {
      await gate;
      await route.fulfill({ json: state.folders });
    });
    const content = page.getByText(
      path === "/trash" ? "삭제된 자료" : "공개 클립",
      { exact: true },
    );
    for (const reload of [false, true]) {
      gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const initialReads = contentReads;
      if (reload) await page.reload();
      else await page.goto(path);
      const loading = page.getByRole("status", {
        name: ko.access.checkingTitle,
      });
      await expect(loading).toBeVisible();
      await expect(loading).toHaveAttribute("aria-busy", "true");
      await expect(loading.locator(".skeleton-shimmer").first()).toBeVisible();
      await expect(
        page.getByRole("heading", { name: ko.access.checkingTitle }),
      ).toHaveCount(0);
      await expect(content).toHaveCount(0);
      expect(contentReads).toBe(initialReads);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (reload)
        await page.screenshot({
          path: testInfo.outputPath("access-loading.png"),
          animations: "disabled",
        });
      release();
      await expect(loading).toHaveCount(0);
      await expect(content).toBeVisible();
    }
  });
}

test("재확인이 실패하거나 폴더가 잠겨 있으면 기존 안내와 재시도를 유지한다", async ({
  page,
}) => {
  const state = await setup(page);
  let fail = true;
  await page.route("**/folders", (route) =>
    fail
      ? route.fulfill({ status: 500, json: { message: "error" } })
      : route.fulfill({ json: state.folders }),
  );
  await page.goto("/folder/b");
  await expect(
    page.getByRole("heading", { name: ko.access.errorTitle }),
  ).toBeVisible();
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
  fail = false;
  await page
    .locator("main")
    .getByRole("button", { name: ko.access.retry, exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: ko.access.lockedTitle }),
  ).toBeVisible();
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
});
