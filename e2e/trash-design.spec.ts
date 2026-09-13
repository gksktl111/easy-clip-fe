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
    r.fulfill({
      json: [{ id: "folder-1", name: "프로젝트", order: 0, isLocked: false }],
    }),
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
      await expect(row.getByRole("button")).toHaveCount(1);
      await expect(
        row.getByRole("button", { name: t.restore, exact: true }),
      ).toHaveCount(0);
      await expect(
        row.getByRole("button", { name: t.deleteForever, exact: true }),
      ).toHaveCount(0);
      await row.getByRole("button").focus();
      await expect(row.getByRole("button")).toBeFocused();
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
  await clipRow.getByRole("button").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "복구", exact: true })
    .click();
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

test("모바일 상세 화면에서 전체 텍스트·이미지·색상을 보고 닫을 수 있다", async ({
  page,
}) => {
  const state = await setup(page);
  const longText = "첫 줄\n" + "전체 본문 확인 ".repeat(150) + "\n마지막 줄";
  state.items = [
    {
      itemType: "CLIP",
      id: "text",
      title: "긴 메모",
      type: "TEXT",
      folderId: "folder-1",
      deletedAt: null,
      textContent: longText,
      imageUrl: null,
      colorHex: null,
    },
    {
      itemType: "CLIP",
      id: "image",
      title: "참고 이미지",
      type: "IMAGE",
      folderId: "folder-1",
      deletedAt: null,
      textContent: null,
      imageUrl: "https://cdn.easy-clip.app/preview.png",
      colorHex: null,
    },
    {
      itemType: "CLIP",
      id: "color",
      title: "브랜드 색상",
      type: "COLOR",
      folderId: "folder-1",
      deletedAt: null,
      textContent: null,
      imageUrl: null,
      colorHex: "#246A73",
    },
  ];
  await page.route("**/_next/image**", (route) =>
    route.fulfill({
      contentType: "image/png",
      path: "public/landing/white_main_desktop.png",
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trash");
  for (const name of ["긴 메모", "참고 이미지", "브랜드 색상"]) {
    const trigger = page.getByRole("button", {
      name: ko.trash.viewDetails.replace("{name}", name),
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: ko.trash.details });
    await expect(dialog).toBeVisible();
    if (name === "긴 메모")
      await expect(dialog.locator("pre")).toHaveText(longText);
    if (name === "참고 이미지") {
      const image = dialog.getByRole("img", { name });
      await expect(image).toBeVisible();
      await expect
        .poll(() =>
          image.evaluate((node: HTMLImageElement) => node.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    if (name === "브랜드 색상")
      await expect(dialog.locator("pre")).toHaveText("#246A73");
    await expect(
      dialog.getByRole("button", { name: ko.trash.restore, exact: true }),
    ).toBeInViewport();
    expect(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  expect(state.requests).toHaveLength(0);
});

test("모바일 하단 선택 작업은 목록을 가리지 않고 스크롤 후에도 접근할 수 있다", async ({
  page,
}) => {
  const state = await setup(page);
  state.items = Array.from({ length: 12 }, (_, index) => ({
    itemType: "CLIP",
    id: String(index),
    title: `메모 ${index}`,
    type: "TEXT",
    folderId: "folder-1",
    deletedAt: null,
    textContent: "다시 확인할 내용",
    imageUrl: null,
    colorHex: null,
  }));
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/trash");
  await page.locator("article").first().getByRole("checkbox").check();
  const footer = page.locator("main footer");
  await expect(
    footer.getByRole("button", { name: ko.trash.restoreSelected, exact: true }),
  ).toBeInViewport();
  await page.locator("article").last().scrollIntoViewIfNeeded();
  const lastRow = await page.locator("article").last().boundingBox();
  const bar = await footer.boundingBox();
  expect(lastRow!.y + lastRow!.height).toBeLessThanOrEqual(bar!.y + 1);
  await footer.getByRole("button", { name: ko.trash.cancelSelection }).click();
  await expect(footer).toHaveCount(0);
  expect(state.requests).toHaveLength(0);
});

test("상세 화면의 영구 삭제는 확인 후에만 요청한다", async ({ page }) => {
  const state = await setup(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trash");
  await page
    .getByRole("button", {
      name: ko.trash.viewDetails.replace("{name}", "프로젝트 아카이브"),
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: ko.trash.deleteForever })
    .click();
  await expect(
    page.getByRole("dialog", { name: ko.trash.deleteItemTitle }),
  ).toBeVisible();
  expect(state.requests).toHaveLength(0);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: ko.trash.cancel, exact: true })
    .click();
  expect(state.requests).toHaveLength(0);
  await page
    .getByRole("button", {
      name: ko.trash.viewDetails.replace("{name}", "프로젝트 아카이브"),
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: ko.trash.deleteForever })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: ko.trash.deleteForever })
    .click();
  await expect.poll(() => state.requests.length).toBe(1);
  expect(state.requests[0]).toMatchObject({
    method: "DELETE",
    path: "/trash/items",
    body: { items: [{ itemType: "FOLDER", id: "old-folder" }] },
  });
});

test("구버전 응답은 원본 없음 안내를 표시하고 복구 실패 후 선택을 유지한다", async ({
  page,
}) => {
  const state = await setup(page);
  state.failRestore = true;
  await page.goto("/trash");
  const row = page.locator("article").filter({ hasText: "Long title" });
  await row.getByRole("button", { name: /상세 보기/ }).click();
  await expect(
    page.getByRole("dialog").getByText(ko.trash.contentUnavailable),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await row.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: ko.trash.restoreSelected, exact: true })
    .click();
  await expect(
    page.getByText(ko.trash.restoreConflictError, { exact: true }),
  ).toBeVisible();
  await expect(row.getByRole("checkbox")).toBeChecked();
  await expect(
    page.getByRole("button", { name: ko.trash.restoreSelected, exact: true }),
  ).toBeEnabled();
});
