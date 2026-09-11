import { test, expect } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";

for (const fails of [false, true]) {
  test(`열람 기록 ${fails ? "실패" : "성공"} 후 폴더 재조회 없이 최근 목록만 갱신한다`, async ({
    page,
  }) => {
    const state = await setup(page, true);
    let views = 0;
    await page.addInitScript(() =>
      Object.defineProperty(navigator.clipboard, "writeText", {
        configurable: true,
        value: async () => {},
      }),
    );
    await page.route("**/clips/*/views", (r) => {
      views++;
      return fails
        ? r.fulfill({ status: 500, json: { message: "기록 실패" } })
        : r.fulfill({ json: {} });
    });
    await page.goto("/folder/a");
    const copy = page.getByRole("button", {
      name: ko.clips.item.copy.replace("{name}", "공개 클립"),
      exact: true,
    });
    await expect(copy).toBeVisible();
    const initial = state.reads.length;
    await copy.click();
    await expect.poll(() => views).toBe(1);
    await page
      .getByRole("link", { name: ko.sidebar.recent, exact: true })
      .click();
    await expect(copy).toBeVisible();
    expect(
      state.reads
        .slice(initial)
        .every((url) => new URL(url).searchParams.get("recent") === "true"),
    ).toBe(true);
    const beforeRecentCopy = state.reads.length;
    await copy.click();
    await expect.poll(() => views).toBe(2);
    await expect
      .poll(() => state.reads.length)
      .toBeGreaterThan(beforeRecentCopy);
    expect(
      state.reads
        .slice(beforeRecentCopy)
        .every((url) => new URL(url).searchParams.get("recent") === "true"),
    ).toBe(true);
    await expect(
      page.locator('[data-sonner-toast][data-removed="false"]'),
    ).toContainText(ko.feedback.copySuccess);
  });
}
