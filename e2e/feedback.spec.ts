import { test, expect } from "./fixtures";
import { setup } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  test(`${locale} 복사 알림 중복 방지와 모바일 키보드 닫기`, async ({
    page,
  }, testInfo) => {
    await setup(page, true, locale);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() =>
      Object.defineProperty(navigator.clipboard, "writeText", {
        configurable: true,
        value: async () => {},
      }),
    );
    await page.route("**/clips/*/views", (r) =>
      r.fulfill({ status: 500, json: { message: "기록 실패" } }),
    );
    await page.goto("/folder/a");
    const copy = page.getByRole("button", {
      name: messages.clips.item.copy.replace("{name}", "공개 클립"),
      exact: true,
    });
    await copy.click();
    const toast = page.locator('[data-sonner-toast][data-removed="false"]');
    await expect(toast).toContainText(messages.feedback.copySuccess);
    await copy.click();
    await expect(toast).toHaveCount(1);
    await expect(toast).not.toContainText(messages.feedback.copyError);
    const box = await toast.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    await page.screenshot({
      path: testInfo.outputPath("copy-toast.png"),
      animations: "disabled",
    });
    await page.keyboard.press("Alt+t");
    await page.keyboard.press("Tab");
    await expect(toast).toBeFocused();
    await page.keyboard.press("Tab");
    const close = toast.getByRole("button", { name: messages.feedback.close });
    await expect(close).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(toast).toHaveCount(0);
    await page.evaluate(() =>
      Object.defineProperty(navigator.clipboard, "writeText", {
        value: async () => {
          throw new Error("denied");
        },
      }),
    );
    await copy.click();
    await expect(toast).toContainText(messages.feedback.copyError);
  });
}

test("휴지통 실제 개수, 복원 충돌, 후속 조회 실패를 구분한다", async ({
  page,
}) => {
  await setup(page, true);
  let failLoad = false;
  let conflict = true;
  let calls = 0;
  await page.route("**/trash?**", (r) =>
    failLoad
      ? r.fulfill({ status: 403, json: { message: "조회 실패" } })
      : r.fulfill({
          json: {
            items: [
              {
                itemType: "FOLDER",
                id: "old",
                name: "복원 대상",
                deletedAt: null,
              },
            ],
            nextCursor: null,
            hasNextPage: false,
          },
        }),
  );
  await page.route("**/trash/restore", async (r) => {
    calls++;
    if (conflict)
      return r.fulfill({ status: 409, json: { message: "conflict" } });
    failLoad = true;
    return r.fulfill({ json: { restoredCount: 3 } });
  });
  await page.goto("/trash");
  const details = page.locator("article").getByRole("button");
  const restore = page
    .getByRole("dialog")
    .getByRole("button", { name: ko.trash.restore, exact: true });
  await details.click();
  await restore.click();
  const toasts = page.locator('[data-sonner-toast][data-removed="false"]');
  await expect(toasts).toContainText(ko.trash.restoreConflictError);
  await expect(
    page.locator("main").getByText(ko.trash.restoreConflictError),
  ).toHaveCount(0);
  await toasts.getByRole("button", { name: ko.feedback.close }).click();
  conflict = false;
  await details.click();
  await restore.click();
  await expect(toasts).toContainText("항목 3개를 복원했습니다.");
  await expect(page.getByText(ko.trash.error, { exact: true })).toBeVisible();
  expect(calls).toBe(2);
  await expect(toasts).not.toContainText(ko.trash.actionError);
  await page
    .getByRole("button", { name: ko.trash.refresh, exact: true })
    .click();
  await expect(
    toasts.filter({ hasText: ko.feedback.refreshError }),
  ).toBeVisible();
  await expect(
    toasts.filter({ hasText: ko.feedback.refreshSuccess }),
  ).toHaveCount(0);
});

test("클립 전체 삭제는 서버 개수를 표시하고 실패하면 성공을 알리지 않는다", async ({
  page,
}) => {
  await setup(page, true);
  let fail = false;
  let calls = 0;
  await page.route("**/clips/all/a", (r) => {
    calls++;
    return fail
      ? r.fulfill({ status: 500, json: { message: "실패" } })
      : r.fulfill({ json: { deletedCount: 7 } });
  });
  await page.goto("/folder/a");
  const removeAll = async () => {
    await page
      .getByRole("button", { name: ko.clips.actions.deleteClips, exact: true })
      .click();
    await page
      .getByRole("button", { name: ko.clips.deleteMode.deleteAll, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: ko.clips.actions.delete, exact: true })
      .click();
  };
  await removeAll();
  const toasts = page.locator('[data-sonner-toast][data-removed="false"]');
  await expect(toasts).toContainText("클립 7개를 휴지통으로 이동했습니다.");
  await toasts.getByRole("button", { name: ko.feedback.close }).click();
  fail = true;
  await removeAll();
  await expect(toasts).toContainText(ko.feedback.deleteError);
  expect(calls).toBe(2);
});

test("설정 저장 결과는 모달 위에서 닫을 수 있고 실패 시 값을 복원한다", async ({
  page,
}, testInfo) => {
  await setup(page, true);
  let fail = false;
  await page.route("**/users/me/settings", async (r) => {
    if (r.request().method() !== "PATCH") return r.fallback();
    return fail
      ? r.fulfill({ status: 500, json: { message: "실패" } })
      : r.fulfill({
          json: {
            id: "settings",
            userId: "user-1",
            theme: "DARK",
            language: "ko",
          },
        });
  });
  await page.goto("/folder/a");
  await page.getByRole("button", { name: "사용 사용자", exact: true }).click();
  await page
    .getByRole("button", { name: ko.sidebar.settings, exact: true })
    .click();
  const toggle = page.getByRole("button", { name: ko.settings.toggleDarkMode });
  await toggle.click();
  const toasts = page.locator('[data-sonner-toast][data-removed="false"]');
  await expect(toasts).toContainText(ko.feedback.settingsSaved);
  await page.screenshot({
    path: testInfo.outputPath("settings-toast.png"),
    animations: "disabled",
  });
  await toasts.getByRole("button", { name: ko.feedback.close }).click();
  fail = true;
  await toggle.click();
  await expect(toasts).toContainText(ko.settings.saveError);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText(ko.settings.saveError, { exact: true }),
  ).toHaveCount(1);
});
