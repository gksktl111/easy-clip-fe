import { test, expect } from "./fixtures";
import { setup, clip } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  test(`${locale} 데스크톱 비활성 안내와 모바일 붙여넣기 버튼을 분리한다`, async ({
    page,
  }) => {
    await setup(page, false, locale);
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    let writes = 0;
    await page.route("**/clips", (route) => {
      writes++;
      return route.fulfill({ json: clip("new", "a", "키보드 저장") });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/folder/a");
    const hint = page.getByText(messages.clips.captureHint, { exact: true });
    const button = page.getByRole("button", {
      name: messages.clips.pasteAction,
      exact: true,
    });
    await expect(hint).toBeVisible();
    await expect(button).toBeHidden();
    // 안내 자체를 클릭해도 기존 페이지 활성화 이벤트가 전달되어야 합니다.
    await hint.click();
    await expect(hint).toBeHidden();
    await page.evaluate(() => navigator.clipboard.writeText("키보드 저장"));
    await page.keyboard.press("Control+V");
    await expect.poll(() => writes).toBe(1);
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(hint).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(hint).toBeHidden();
    await expect(button).toBeVisible();
    await page.getByText("공개 클립", { exact: true }).click();
    await expect(button).toBeVisible();
    await page.evaluate(() => navigator.clipboard.writeText("모바일 저장"));
    await button.click();
    await expect.poll(() => writes).toBe(2);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(button).toBeHidden();
    await expect(hint).toBeHidden();
  });
}
