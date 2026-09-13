import { test, expect } from "./fixtures";
import { setup, free, pro, clip } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";

for (const [locale, messages] of Object.entries({ ko, en, ja, zh })) {
  test(`${locale} Free는 모든 목록에서 검색·태그 편집 없이 기존 태그와 유형 필터를 유지한다`, async ({
    page,
  }) => {
    await setup(page, false, locale);
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.route("**/clips?**", (route) =>
      route.fulfill({
        json: {
          items: [
            {
              ...clip("ca", "a", "보존 클립"),
              tags: [{ id: "tag", name: "보존 태그", backgroundColor: "GRAY" }],
            },
          ],
          hasMore: false,
          nextCursor: null,
        },
      }),
    );
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/folder/a", "/favorites", "/recent"]) {
        await page.goto(path);
        await expect(
          page.getByText("보존 태그", { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByPlaceholder(messages.clips.filter.searchPlaceholder),
        ).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: messages.clips.filter.searchPlaceholder,
          }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: messages.clips.tags.manage,
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: messages.clips.item.editTags.replace("{name}", "보존 클립"),
          }),
        ).toHaveCount(0);
        if (width === 1280) {
          await page
            .getByRole("button", {
              name: messages.clips.filter.text,
              exact: true,
            })
            .click();
        } else {
          await expect(
            page
              .locator('button[aria-haspopup="listbox"]')
              .filter({ visible: true }),
          ).toBeVisible();
        }
        if (path === "/folder/a") {
          await page
            .getByRole("button", {
              name: messages.clips.item.openOptions.replace(
                "{name}",
                "보존 클립",
              ),
            })
            .click();
          await expect(
            page.getByRole("button", {
              name: messages.clips.tags.editAction,
              exact: true,
            }),
          ).toHaveCount(0);
          await page.keyboard.press("Escape");
          if (width !== 1280)
            await expect(
              page.getByRole("button", {
                name: messages.clips.pasteAction,
                exact: true,
              }),
            ).toBeVisible();
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBe(width);
      }
    }
    expect(
      requests
        .filter((url) => /\/clips\?/.test(url))
        .some((url) => new URL(url).searchParams.has("q")),
    ).toBe(false);
    expect(
      requests.some((url) => /\/(?:folders|clips)\/[^/]+\/tags/.test(url)),
    ).toBe(false);
  });
}

for (const path of ["/folder/a", "/favorites", "/recent"]) {
  test(`${path} Pro 검색 중 Free 전환 후 재구독해도 이전 검색어와 응답을 복원하지 않는다`, async ({
    page,
  }) => {
    const state = await setup(page, true);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const reads: { q: string | null; cursor: string | null; paid: boolean }[] =
      [];
    await page.route("**/clips?**", async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const q = params.get("q");
      reads.push({
        q,
        cursor: params.get("cursor"),
        paid: state.subscription.plan === "PRO",
      });
      if (q) await gate;
      await route
        .fulfill({
          json: {
            items: [clip("ca", "a", q ? "지난 검색 결과" : "기본 목록")],
            hasMore: false,
            nextCursor: null,
          },
        })
        .catch(() => {});
    });
    await page.goto(path);
    await page
      .getByPlaceholder(ko.clips.filter.searchPlaceholder)
      .filter({ visible: true })
      .fill("유료 검색");
    await expect
      .poll(() => reads.some((read) => read.q === "유료 검색"))
      .toBe(true);
    state.subscription = { ...free };
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(
      page.getByPlaceholder(ko.clips.filter.searchPlaceholder),
    ).toHaveCount(0);
    await expect.poll(() => reads.some((read) => !read.paid)).toBe(true);
    release();
    await expect(page.getByText("기본 목록", { exact: true })).toBeVisible();
    await expect(page.getByText("지난 검색 결과", { exact: true })).toHaveCount(
      0,
    );
    expect(
      reads
        .filter((read) => !read.paid)
        .every((read) => !read.q && !read.cursor),
    ).toBe(true);
    state.subscription = { ...pro };
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(
      page
        .getByPlaceholder(ko.clips.filter.searchPlaceholder)
        .filter({ visible: true }),
    ).toHaveValue("");
    await page.waitForTimeout(400);
    expect(reads.filter((read) => read.q)).toHaveLength(1);
  });
}

test("접근 폴더가 그대로여도 Free 전환은 열린 태그 관리와 늦은 조회를 폐기한다", async ({
  page,
}) => {
  const state = await setup(page, true);
  let release!: () => void;
  let reads = 0;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/folders/a/tags", async (route) => {
    reads++;
    await gate;
    await route
      .fulfill({
        json: [
          {
            id: "tag",
            folderId: "a",
            name: "늦은 태그",
            backgroundColor: "GRAY",
          },
        ],
      })
      .catch(() => {});
  });
  await page.goto("/folder/a");
  await page
    .getByRole("button", { name: ko.clips.tags.manage, exact: true })
    .click();
  await expect.poll(() => reads).toBe(1);
  state.subscription = { ...free };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("dialog")).toHaveCount(0);
  release();
  await expect(
    page.getByRole("button", { name: ko.clips.tags.manage, exact: true }),
  ).toHaveCount(0);
  state.subscription = { ...pro };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("button", { name: ko.clips.tags.manage, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: ko.clips.tags.manage, exact: true })
    .click();
  await expect.poll(() => reads).toBe(2);
});

test("해지 예약 후 유효 기간이 남은 Pro는 검색과 태그 관리를 유지한다", async ({
  page,
}) => {
  const state = await setup(page, true);
  state.subscription = { ...pro, status: "CANCELED", autoRenew: false };
  await page.route("**/folders/a/tags", (route) => route.fulfill({ json: [] }));
  await page.goto("/folder/a");
  await page
    .getByPlaceholder(ko.clips.filter.searchPlaceholder)
    .filter({ visible: true })
    .fill("검색 유지");
  await expect
    .poll(() =>
      state.reads.some(
        (url) => new URL(url).searchParams.get("q") === "검색 유지",
      ),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: ko.clips.tags.manage, exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("반복 검색 FEATURE_NOT_AVAILABLE은 검색 Pro 안내를 표시하고 자동 재조회를 반복하지 않는다", async ({
  page,
}) => {
  await setup(page, true);
  let rejected = 0;
  await page.route("**/clips?**", (route) => {
    if (!new URL(route.request().url()).searchParams.has("q"))
      return route.fallback();
    rejected++;
    return route.fulfill({
      status: 403,
      json: { code: "FEATURE_NOT_AVAILABLE", message: "unavailable" },
    });
  });
  await page.goto("/recent");
  await page
    .getByPlaceholder(ko.clips.filter.searchPlaceholder)
    .filter({ visible: true })
    .fill("검색");
  // 첫 정책 오류는 권한을 재확인하며 검색 입력을 초기화한다.
  await expect.poll(() => rejected).toBe(1);
  await expect(
    page
      .getByPlaceholder(ko.clips.filter.searchPlaceholder)
      .filter({ visible: true }),
  ).toHaveValue("");
  await page
    .getByPlaceholder(ko.clips.filter.searchPlaceholder)
    .filter({ visible: true })
    .fill("검색");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    ko.access.proRequired.search,
  );
  await page.waitForTimeout(500);
  expect(rejected).toBe(2);
});

test("태그 조회 FEATURE_NOT_AVAILABLE은 서버 문구 대신 태그 Pro 안내를 표시한다", async ({
  page,
}) => {
  await setup(page, true);
  let reads = 0;
  await page.route("**/folders/a/tags", (route) => {
    reads++;
    return route.fulfill({
      status: 403,
      json: {
        statusCode: 403,
        code: "FEATURE_NOT_AVAILABLE",
        message: "서버 문구가 변경되어도 분기하지 않음",
        error: "Forbidden",
      },
    });
  });
  await page.goto("/folder/a");
  const open = page.getByRole("button", {
    name: ko.clips.tags.manage,
    exact: true,
  });
  await open.click();
  await expect.poll(() => reads).toBe(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await open.click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
    ko.access.proRequired.tags,
  );
  await page.waitForTimeout(500);
  expect(reads).toBe(2);
});
