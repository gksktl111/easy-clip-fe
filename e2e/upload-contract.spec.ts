import { expect, test } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";

test("업로드 429는 초안을 유지하고 Retry-After 동안 재전송을 차단한다", async ({
  page,
}) => {
  await setup(page);
  let writes = 0;
  await page.route("**/clips", (route) => {
    writes++;
    return route.fulfill({
      status: 429,
      headers: {
        "Retry-After": "2",
        "Access-Control-Expose-Headers": "Retry-After",
      },
      json: { code: "UPLOAD_RATE_LIMIT_EXCEEDED" },
    });
  });
  await page.goto("/folder/a");
  await page.getByText(ko.clips.captureHint, { exact: true }).click();
  await page.evaluate(() => {
    const clipboardData = new DataTransfer();
    clipboardData.items.add(
      new File(["mock image"], "test.png", { type: "image/png" }),
    );
    document.body.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData }),
    );
  });
  const retry = page.getByRole("button", { name: ko.access.retrySave });
  await expect(retry).toBeDisabled();
  await expect(
    page.getByRole("region", { name: ko.access.draftTitle }),
  ).toContainText("초 후에");
  expect(writes).toBe(1);
  await expect(retry).toBeEnabled();
  expect(writes).toBe(1);
  await retry.click();
  await expect.poll(() => writes).toBe(2);
});
