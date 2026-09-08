import { expect, test, type Page } from "./fixtures";
import type { TrashItemResponseDto } from "../src/features/trash/model/trash.dto";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";
const messages = { ko, en, ja, zh };

async function setup(page: Page, locale: keyof typeof messages = "ko") {
  const state = {
    items: [
      {
        itemType: "FOLDER",
        id: "old-folder",
        name: "프로젝트 아카이브",
        deletedAt: "2026-09-08T00:00:00Z",
      },
      {
        itemType: "CLIP",
        id: "clip-1",
        title: "Long title · 長いタイトル · 긴 제목 · 剪贴内容",
        type: "TEXT",
        folderId: "folder-1",
        deletedAt: "2026-09-08T00:00:00Z",
      },
    ] as TrashItemResponseDto[],
    failLoad: false,
    failRestore: false,
    requests: [] as Array<{ method: string; path: string; body: unknown }>,
  };
  await page.context().addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test",
      domain: "127.0.0.1",
      path: "/",
    },
    {
      name: "easy_clip_language",
      value: locale,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.route("**/users/me", (r) =>
    r.fulfill({
      json: {
        id: "user-1",
        displayName: "테스트",
        avatarUrl: null,
        authAccounts: [],
      },
    }),
  );
  await page.route("**/users/me/settings", (r) =>
    r.fulfill({
      json: {
        id: "settings-1",
        userId: "user-1",
        theme: "LIGHT",
        language: locale,
      },
    }),
  );
  await page.route("**/folders", (r) =>
    r.fulfill({ json: [{ id: "folder-1", name: "프로젝트", order: 0, isLocked: false }] }),
  );
  await page.route("**/trash?**", (r) =>
    state.failLoad
      ? r.fulfill({ status: 403, json: { message: "조회 실패" } })
      : r.fulfill({
          json: { items: state.items, hasNextPage: false, nextCursor: null },
        }),
  );
  await page.route(/\/trash(?:\/restore|\/items)?$/, async (r) => {
    const req = r.request();
    if (req.method() === "GET") return r.fallback();
    const path = new URL(req.url()).pathname;
    const body = req.postData() ? req.postDataJSON() : null;
    state.requests.push({ method: req.method(), path, body });
    if (state.failRestore && path.endsWith("restore")) {
      return r.fulfill({ status: 409, json: { message: "복구 충돌" } });
    }
    const ids = new Set<string>(
      body?.items.map((item: { id: string }) => item.id),
    );
    state.items = body ? state.items.filter((item) => !ids.has(item.id)) : [];
    return r.fulfill({
      json: {
        restoredCount: 1,
        totalDeleted: 1,
        foldersDeleted: 1,
        clipsDeleted: 0,
      },
    });
  });
  return state;
}

for (const locale of ["ko", "en", "ja", "zh"] as const) {
  test(`${locale} 휴지통의 모바일·데스크톱 선택 상태와 액션이 유지된다`, async ({
    page,
  }) => {
    await setup(page, locale);
    const t = messages[locale].trash;
    await page.goto("/trash");
    await expect(
      page.getByText("프로젝트 아카이브", { exact: true }),
    ).toBeVisible();
    for (const width of [390, 1200, 1440, 720]) {
      await page.setViewportSize({ width, height: 900 });
      const row = page
        .locator("article")
        .filter({ hasText: "프로젝트 아카이브" });
      await row.getByRole("checkbox").check();
      await expect(row).toHaveAttribute("data-selected", "true");
      await expect(
        page.getByRole("button", { name: t.restoreSelected, exact: true }),
      ).toBeVisible();
      await row.getByRole("button", { name: t.restore, exact: true }).focus();
      await expect(
        row.getByRole("button", { name: t.restore, exact: true }),
      ).toBeFocused();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
        true,
      );
      await row.getByRole("checkbox").uncheck();
    }
  });
}

test("휴지통 복구와 선택 삭제 취소·확정, 전체 비우기를 유지한다", async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto("/trash");
  const clipRow = page.locator("article").filter({ hasText: "Long title" });
  await clipRow.getByRole("button", { name: "복구", exact: true }).click();
  await expect(clipRow).toHaveCount(0);
  expect(state.requests[0]).toMatchObject({
    method: "PATCH",
    path: "/trash/restore",
    body: { items: [{ itemType: "CLIP", id: "clip-1" }] },
  });
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article").getByRole("checkbox")).toBeEnabled();
  await page.locator("article").getByRole("checkbox").check();
  await page
    .getByRole("button", { name: ko.trash.deleteSelected, exact: true })
    .click();
  await page
    .getByRole("button", { name: ko.trash.cancel, exact: true })
    .click();
  expect(state.requests).toHaveLength(1);
  await page
    .getByRole("button", { name: ko.trash.deleteSelected, exact: true })
    .click();
  await page
    .getByRole("button", { name: ko.trash.deleteSelected, exact: true })
    .last()
    .click();
  await expect(
    page.getByText(ko.trash.emptyTitle, { exact: true }),
  ).toBeVisible();
  expect(state.requests[1]).toMatchObject({
    method: "DELETE",
    path: "/trash/items",
  });

  state.items = [
    { itemType: "FOLDER", id: "folder-2", name: "남은 폴더", deletedAt: null },
  ];
  await page
    .getByRole("button", { name: ko.trash.refresh, exact: true })
    .click();
  await expect(page.getByText("남은 폴더", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: ko.trash.clearAll, exact: true })
    .click();
  await page
    .getByRole("button", { name: ko.trash.clearAll, exact: true })
    .last()
    .click();
  await expect(
    page.getByText(ko.trash.emptyTitle, { exact: true }),
  ).toBeVisible();
  expect(state.requests[2]).toMatchObject({ method: "DELETE", path: "/trash" });
});

test("휴지통 조회 오류에서 빈 상태를 함께 표시하지 않고 재시도한다", async ({
  page,
}) => {
  const state = await setup(page);
  state.failLoad = true;
  await page.goto("/trash");
  await expect(page.getByText(ko.trash.error, { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByText(ko.trash.emptyTitle, { exact: true }),
  ).toHaveCount(0);
  state.failLoad = false;
  await page
    .getByRole("button", { name: ko.trash.refresh, exact: true })
    .click();
  await expect(
    page.getByText("프로젝트 아카이브", { exact: true }),
  ).toBeVisible();
});
