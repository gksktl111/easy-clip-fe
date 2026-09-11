import { test, expect } from "./fixtures";
import { setup, clip } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  for (const theme of ["LIGHT", "DARK"]) {
    test(`${locale} ${theme} 3개 화면 폭에서 랜딩·요금·결제·설정 배치와 키보드 조작`, async ({
      page,
    }) => {
      await setup(page, false, locale);
      await page.route("**/users/me/settings", (r) =>
        r.fulfill({
          json: {
            id: "settings",
            userId: "user-1",
            theme,
            language: locale,
          },
        }),
      );
      await page.context().addCookies([
        {
          name: "easy_clip_theme",
          value: theme.toLowerCase(),
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of ["/", "/pricing", "/billing"]) {
          if (path === "/")
            await page
              .context()
              .clearCookies({ name: "easy_clip_refresh_token" });
          else
            await page.context().addCookies([
              {
                name: "easy_clip_refresh_token",
                value: "test",
                domain: "127.0.0.1",
                path: "/",
              },
            ]);
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
        }
        await page.goto("/folder/a");
        await expect(
          page.getByText("공개 클립", { exact: true }),
        ).toBeVisible();
        if (width < 768)
          await page
            .getByRole("button", { name: messages.sidebar.open })
            .click();
        const trigger = page.getByRole("button", {
          name: "사용 사용자",
          exact: true,
        });
        await trigger.click();
        await page
          .getByRole("button", { name: messages.sidebar.settings, exact: true })
          .click();
        const dialog = page.getByRole("dialog", {
          name: messages.settings.title,
        });
        await expect(dialog).toBeVisible();
        for (let i = 0; i < 12; i++) {
          await page.keyboard.press("Tab");
          expect(
            await dialog.evaluate((node) =>
              node.contains(document.activeElement),
            ),
          ).toBe(true);
        }
        await page.keyboard.press("Shift+Tab");
        expect(
          await dialog.evaluate((node) =>
            node.contains(document.activeElement),
          ),
        ).toBe(true);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
      }
    });
  }
}

test("긴 제목·본문·전체 태그 미리보기에서 복사하고 원래 버튼으로 돌아온다", async ({
  page,
}) => {
  await setup(page, true);
  const title = "긴 제목 ".repeat(30);
  const content = "줄바꿈 없는긴본문".repeat(120) + "\n마지막 줄";
  await page.addInitScript(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: async (text: string) => {
        sessionStorage.setItem("test-copied", text);
      },
    }),
  );
  await page.route("**/clips/*/views", (r) => r.fulfill({ json: {} }));
  await page.route("**/clips?**", (r) =>
    r.fulfill({
      json: {
        items: [
          {
            ...clip("ca", "a", title),
            textContent: content,
            tags: Array.from({ length: 8 }, (_, i) => ({
              id: `t${i}`,
              folderId: "a",
              name: `태그${i}`,
              backgroundColor: "GRAY",
            })),
          },
        ],
        hasMore: false,
        nextCursor: null,
      },
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/folder/a");
  const trigger = page.getByRole("button", {
    name: ko.clips.item.preview.replace("{name}", title),
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("pre")).toHaveText(content);
  const scrollArea = dialog.locator("pre").locator("..");
  expect(
    await scrollArea.evaluate((node) => node.clientHeight),
  ).toBeGreaterThan(200);
  await scrollArea.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect(dialog.getByRole("heading")).toHaveText(title);
  await expect(dialog.getByRole("listitem")).toHaveCount(8);
  expect(
    await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await dialog
    .getByRole("button", {
      name: ko.clips.item.copy.replace("{name}", title),
      exact: true,
    })
    .click();
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem("test-copied")))
    .toBe(content);
  await dialog
    .getByRole("button", { name: ko.clips.item.closePreview })
    .focus();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("이름 입력·삭제 확인·구독 해지 모달을 키보드로 닫는다", async ({
  page,
}) => {
  await setup(page, true);
  await page.goto("/folder/a");
  await page
    .getByRole("button", { name: ko.sidebar.addFolder, exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: ko.sidebar.folderName, exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: ko.clips.actions.deleteClips, exact: true })
    .click();
  const deleteAll = page.getByRole("button", {
    name: ko.clips.deleteMode.deleteAll,
    exact: true,
  });
  await deleteAll.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(deleteAll).toBeFocused();
  await page.goto("/pricing");
  const cancel = page.getByRole("button", {
    name: ko.pricing.subscription.downgrade,
  });
  await cancel.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cancel).toBeFocused();
});

test("결제 확인 중·완료·결과 불명확·실패 제목을 구분한다", async ({ page }) => {
  await setup(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/subscriptions/me/billing-auth/confirm", async (r) => {
    await gate;
    await r.fulfill({
      status: 201,
      json: {
        plan: "PRO",
        status: "ACTIVE",
        autoRenew: true,
        currentPeriodEnd: "2099-01-01T00:00:00Z",
      },
    });
  });
  const url =
    "/billing/success?authKey=design-auth&customerKey=design-customer";
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: ko.access.billingChecking, exact: true }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", {
      name: ko.access.billingCompleteTitle,
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(url);
  await expect(
    page.getByRole("heading", {
      name: ko.access.billingUncertainTitle,
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/billing/fail");
  await expect(
    page.getByRole("heading", { name: ko.access.billingFailed, exact: true }),
  ).toBeVisible();
});

test("이미지 미리보기는 전체 이미지를 표시하고 폴더가 잠기면 닫힌다", async ({
  page,
}) => {
  const state = await setup(page, true);
  await page.route("**/clips?**", (r) =>
    r.fulfill({
      json: {
        items: [
          {
            ...clip("cb", "b", "이미지 자료"),
            type: "IMAGE",
            textContent: null,
            imageUrl: "/landing/white_main_desktop.png",
          },
        ],
        hasMore: false,
        nextCursor: null,
      },
    }),
  );
  await page.goto("/folder/b");
  await page
    .getByRole("button", {
      name: ko.clips.item.preview.replace("{name}", "이미지 자료"),
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("img", { name: "이미지 자료" })).toHaveCSS(
    "object-fit",
    "contain",
  );
  await expect
    .poll(() =>
      dialog
        .getByRole("img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  state.folders[1].isLocked = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: ko.clips.item.preview.replace("{name}", "이미지 자료"),
    }),
  ).toHaveCount(0);
});
