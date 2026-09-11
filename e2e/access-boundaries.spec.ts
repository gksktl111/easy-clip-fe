import { expect, test, type Page } from "./fixtures";
import { setup, pro, free, clip } from "./access-fixture";
import ko from "../src/messages/ko.json";

async function paste(page: Page, text: string) {
  await page.evaluate((text) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", text);
    document.body.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData }),
    );
  }, text);
}
const focus = (page: Page) =>
  page.evaluate(() => window.dispatchEvent(new Event("focus")));

test("잠긴 폴더 관리 메뉴는 이름·순서 변경을 막고 폴더 삭제는 허용한다", async ({
  page,
}) => {
  const state = await setup(page);
  let deleted = 0;
  await page.route("**/folders/b", (route) => {
    expect(route.request().method()).toBe("DELETE");
    deleted++;
    state.folders = state.folders.filter((f) => f.id !== "b");
    return route.fulfill({ status: 204 });
  });
  await page.goto("/folder/b");
  const row = page
    .locator("li")
    .filter({ has: page.locator('a[href="/folder/b"]') });
  await row.getByRole("button", { name: ko.sidebar.openFolderOptions }).click();
  await expect(
    page.getByRole("button", { name: "이름 변경", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: /^위로 이동/ })).toBeDisabled();
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("다른 잠긴 폴더가 열리지 않습니다");
  await dialog.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.locator('a[href="/folder/b"]')).toHaveCount(0);
  expect(deleted).toBe(1);
});

test("Free 검색과 태그는 접근 폴더에서 작동하고 잠긴 폴더의 캐시를 노출하지 않는다", async ({
  page,
}) => {
  const state = await setup(page, true);
  const tagReads: string[] = [];
  await page.route("**/folders/*/tags", (route) => {
    tagReads.push(route.request().url());
    return route.fulfill({
      json: [
        {
          id: "tag",
          folderId: "b",
          name: "숨길 태그",
          backgroundColor: "GRAY",
        },
      ],
    });
  });
  await page.goto("/folder/b");
  await page.getByRole("button", { name: "태그 관리", exact: true }).click();
  await expect(page.getByText("숨길 태그", { exact: true })).toBeVisible();
  state.subscription = { ...free };
  state.folders[1].isLocked = true;
  await focus(page);
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("숨길 태그", { exact: true })).toHaveCount(0);
  const tagCount = tagReads.length;
  await page.getByRole("button", { name: "다시 확인", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  expect(tagReads).toHaveLength(tagCount);
  await page.locator('a[href="/favorites"]').click();
  await page.getByRole("textbox").fill("비공개");
  await expect
    .poll(() =>
      state.reads.some(
        (url) => new URL(url).searchParams.get("q") === "비공개",
      ),
    )
    .toBe(true);
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
  await page.locator('a[href="/folder/a"]').click();
  await page.getByRole("button", { name: "태그 관리", exact: true }).click();
  await expect
    .poll(() => tagReads.some((url) => url.includes("/folders/a/tags")))
    .toBe(true);
});

test("반복 PROJECT_LOCKED 응답은 권한 재확인 루프와 쓰기 재전송을 만들지 않는다", async ({
  page,
}) => {
  await setup(page);
  let checks = 0;
  let reads = 0;
  await page.route("**/subscriptions/me", (route) => {
    checks++;
    return route.fulfill({ json: free });
  });
  await page.route("**/clips?**", (route) => {
    reads++;
    return route.fulfill({
      status: 403,
      json: { code: "PROJECT_LOCKED", message: "잠금" },
    });
  });
  await page.goto("/folder/a");
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  await expect.poll(() => checks).toBe(2);
  await page.waitForTimeout(500);
  expect(checks).toBe(2);
  expect(reads).toBeLessThanOrEqual(2);
});

for (const resource of ["clips", "trash"] as const) {
  test(`${resource} 두 번째 커서 404에서 자동 재시작을 반복하지 않는다`, async ({
    page,
  }) => {
    await setup(page);
    const cursors: (string | null)[] = [];
    await page.route(`**/${resource}?**`, (route) => {
      const params = new URL(route.request().url()).searchParams;
      if (params.has("_rsc")) return route.fallback();
      const cursor = params.get("cursor");
      cursors.push(cursor);
      return cursor
        ? route.fulfill({ status: 404, json: { message: "커서 만료" } })
        : route.fulfill({
            json: {
              items:
                resource === "clips"
                  ? [clip("one", "a", "유지 항목")]
                  : [
                      {
                        itemType: "FOLDER",
                        id: "one",
                        name: "유지 항목",
                        deletedAt: null,
                      },
                    ],
              ...(resource === "clips"
                ? { hasMore: true }
                : { hasNextPage: true }),
              nextCursor: "server-cursor",
            },
          });
    });
    await page.goto(resource === "clips" ? "/folder/a" : "/trash");
    await expect
      .poll(() => cursors)
      .toEqual([null, "server-cursor", null, "server-cursor"]);
    await page.waitForTimeout(500);
    expect(cursors).toHaveLength(4);
  });
}

test("휴지통 권한 전환은 이전 커서와 선택을 버리고 잠긴 클립을 숨긴다", async ({
  page,
}) => {
  const state = await setup(page, true);
  let stage = 0;
  const cursors: (string | null)[] = [];
  await page.route("**/trash?**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    if (params.has("_rsc")) return route.fallback();
    const cursor = params.get("cursor");
    cursors.push(cursor);
    const item = {
      itemType: "CLIP",
      id: "trash-b",
      folderId: "b",
      title: "숨길 삭제 클립",
      type: "TEXT",
      deletedAt: null,
    };
    return route.fulfill({
      json: {
        items: stage === 1 || cursor ? [] : [item],
        hasNextPage: stage === 0 && !cursor,
        nextCursor: stage === 0 && !cursor ? "old-cursor" : null,
      },
    });
  });
  await page.goto("/trash");
  const row = page.locator("article").filter({ hasText: "숨길 삭제 클립" });
  await row.getByRole("checkbox").check();
  await expect.poll(() => cursors.includes("old-cursor")).toBe(true);
  stage = 1;
  state.subscription = { ...free };
  state.folders[1].isLocked = true;
  const before = cursors.length;
  await focus(page);
  await expect(page.getByText(ko.trash.emptyTitle)).toBeVisible();
  expect(cursors.slice(before)).toEqual([null]);
  stage = 2;
  state.subscription = { ...pro };
  state.folders[1].isLocked = false;
  await focus(page);
  await expect(row).toBeVisible();
  await expect(row.getByRole("checkbox")).not.toBeChecked();
});

for (const limit of [50, 300]) {
  test(`${limit}개 저장 경계는 서버 결과로 처리하고 기존 초과 클립을 자르지 않는다`, async ({
    page,
  }) => {
    await setup(page, limit === 300);
    let count = limit - 1;
    let writes = 0;
    await page.route("**/clips?**", (route) =>
      route.fulfill({
        json: {
          items: [clip("one", "a", "기존 클립")],
          hasMore: false,
          nextCursor: null,
        },
      }),
    );
    await page.route("**/clips", (route) => {
      writes++;
      if (count === limit)
        return route.fulfill({
          status: 409,
          json: {
            code: "CLIP_LIMIT_EXCEEDED",
            message: "한도 초과",
            details: {
              limit,
              currentCount: count,
              upgradeCanResolve: limit === 50,
            },
          },
        });
      count++;
      return route.fulfill({ json: clip("new", "a", "추가 클립") });
    });
    await page.goto("/folder/a");
    await page.getByText("기존 클립", { exact: true }).click();
    await paste(page, "마지막 슬롯");
    await expect.poll(() => writes).toBe(1);
    await expect(
      page.getByText(ko.clips.filter.readyToPaste, { exact: true }).last(),
    ).toBeVisible();
    await paste(page, "한도 초과 입력");
    const draft = page.getByRole("region", { name: "저장하지 못한 클립" });
    await expect(draft).toContainText("한도 초과 입력");
    expect(writes).toBe(2);
    await expect(
      draft.getByRole("link", { name: "Pro 요금제 보기" }),
    ).toHaveCount(limit === 50 ? 1 : 0);
  });
}

test("Free에서 기존 200개 클립을 모든 페이지로 열람하고 이름 수정·삭제할 수 있다", async ({
  page,
}) => {
  await setup(page);
  const items = Array.from({ length: 200 }, (_, i) =>
    clip(`c${i}`, "a", `보존 클립 ${i}`),
  );
  const cursors: (string | null)[] = [];
  await page.route("**/clips?**", (route) => {
    const cursor = new URL(route.request().url()).searchParams.get("cursor");
    cursors.push(cursor);
    const offset = Number(cursor?.replace("page-", "") ?? 0);
    return route.fulfill({
      json: {
        items: items.slice(offset, offset + 50),
        hasMore: offset + 50 < items.length,
        nextCursor: offset + 50 < items.length ? `page-${offset + 50}` : null,
      },
    });
  });
  const writes: string[] = [];
  await page.route("**/clips/c199", (route) => {
    writes.push(route.request().method());
    if (route.request().method() === "PATCH") {
      items[199].title = "보존 이름";
      return route.fulfill({ json: items[199] });
    }
    items.pop();
    return route.fulfill({ status: 204 });
  });
  await page.goto("/folder/a");
  for (const index of [49, 99, 149, 199])
    await page
      .getByText(`보존 클립 ${index}`, { exact: true })
      .scrollIntoViewIfNeeded();
  expect(cursors).toEqual([null, "page-50", "page-100", "page-150"]);
  await page.getByRole("button", { name: "보존 클립 199 옵션 열기" }).click();
  await page.getByRole("button", { name: "이름 변경", exact: true }).click();
  await page.getByRole("dialog").getByRole("textbox").fill("보존 이름");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "변경", exact: true })
    .click();
  await expect(page.getByText("보존 이름", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "보존 이름 옵션 열기" }).click();
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByText("보존 이름", { exact: true })).toHaveCount(0);
  expect(writes).toEqual(["PATCH", "DELETE"]);
});

test("계정 변경 중 늦은 이전 응답을 버리고 같은 폴더 ID라도 새 계정으로 재조회한다", async ({
  page,
}) => {
  const state = await setup(page, true);
  let release!: () => void;
  let oldStarted = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/clips?**", async (route) => {
    if (state.userId === "user-1") {
      oldStarted = true;
      await gate;
      await route
        .fulfill({
          json: {
            items: [clip("old", "a", "이전 계정 비밀")],
            hasMore: false,
            nextCursor: null,
          },
        })
        .catch(() => {});
    } else
      await route.fulfill({
        json: {
          items: [clip("new", "a", "새 계정 클립")],
          hasMore: false,
          nextCursor: null,
        },
      });
  });
  await page.goto("/folder/a");
  await expect.poll(() => oldStarted).toBe(true);
  state.userId = "user-2";
  await focus(page);
  await expect(page.getByText("새 계정 클립", { exact: true })).toBeVisible();
  release();
  await expect(page.getByText("이전 계정 비밀", { exact: true })).toHaveCount(
    0,
  );
});

test("권한 범위가 바뀌면 클립 삭제 선택과 편집 모달이 초기화된다", async ({
  page,
}) => {
  const state = await setup(page, true);
  await page.goto("/folder/a");
  await page.getByRole("button", { name: "클립 삭제", exact: true }).click();
  await page.getByText("공개 클립", { exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: ko.clips.deleteMode.deleteSelected,
      exact: true,
    }),
  ).toBeEnabled();
  state.subscription = { ...free };
  state.folders[1].isLocked = true;
  await focus(page);
  await expect(
    page.getByRole("button", { name: "클립 삭제", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: ko.clips.deleteMode.deleteSelected,
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "공개 클립 옵션 열기" }).click();
  await page.getByRole("button", { name: "이름 변경", exact: true }).click();
  state.subscription = { ...pro };
  state.folders[1].isLocked = false;
  await focus(page);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

for (const error of ["limit", "conflict"] as const) {
  test(`휴지통 혼합 복구 ${error} 실패는 부분 성공 없이 선택을 보존한다`, async ({
    page,
  }) => {
    await setup(page);
    const items = [
      { itemType: "FOLDER", id: "old", name: "복구 폴더", deletedAt: null },
      {
        itemType: "CLIP",
        id: "child",
        folderId: "a",
        title: "별도 삭제 클립",
        type: "TEXT",
        deletedAt: null,
      },
      {
        itemType: "CLIP",
        id: "locked",
        folderId: "b",
        title: "숨겨진 삭제 클립",
        type: "TEXT",
        deletedAt: null,
      },
    ];
    await page.route("**/trash?**", (route) =>
      new URL(route.request().url()).searchParams.has("_rsc")
        ? route.fallback()
        : route.fulfill({
            json: { items, hasNextPage: false, nextCursor: null },
          }),
    );
    let requests = 0;
    await page.route("**/trash/restore", (route) => {
      requests++;
      expect(route.request().postDataJSON()).toEqual({
        items: [
          { itemType: "FOLDER", id: "old" },
          { itemType: "CLIP", id: "child" },
        ],
      });
      return route.fulfill({
        status: 409,
        json:
          error === "limit"
            ? {
                code: "CLIP_LIMIT_EXCEEDED",
                message: "한도 초과",
                details: {
                  limit: 50,
                  currentCount: 300,
                  upgradeCanResolve: false,
                },
              }
            : { message: "부모 폴더를 먼저 복구해주세요" },
      });
    });
    await page.goto("/trash");
    await expect(
      page.getByText("숨겨진 삭제 클립", { exact: true }),
    ).toHaveCount(0);
    await page.getByRole("checkbox", { name: ko.trash.selectAll }).check();
    await page
      .getByRole("button", { name: ko.trash.restoreSelected, exact: true })
      .click();
    await expect(page.locator("[data-sonner-toast]")).toContainText(
      error === "limit"
        ? ko.access.errors.CLIP_LIMIT_EXCEEDED
        : ko.trash.restoreConflictError,
    );
    await expect(
      page
        .getByRole("main")
        .getByRole("alert")
        .getByRole("link", { name: ko.access.plans }),
    ).toHaveCount(0);
    await expect(page.locator("article")).toHaveCount(2);
    for (const box of await page.locator("article").getByRole("checkbox").all())
      await expect(box).toBeChecked();
    expect(requests).toBe(1);
  });
}

test("활성 폴더가 없는 Free는 폴더를 생성하고 최신 isLocked를 확인한 뒤 콘텐츠를 연다", async ({
  page,
}) => {
  const state = await setup(page);
  state.folders = [];
  let creates = 0;
  await page.route("**/folders", (route) => {
    if (route.request().method() === "POST") {
      creates++;
      expect(route.request().postDataJSON()).toEqual({ name: "첫 폴더" });
      state.folders = [{ id: "a", name: "첫 폴더", order: 0, isLocked: false }];
      return route.fulfill({
        status: 201,
        json: { id: "a", name: "첫 폴더", order: 0 },
      });
    }
    return route.fulfill({ json: state.folders });
  });
  await page.goto("/recent");
  await expect(
    page.getByRole("status", { name: ko.access.checkingTitle }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: ko.sidebar.addFolder, exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("첫 폴더");
  await dialog
    .getByRole("button", { name: ko.sidebar.create, exact: true })
    .click();
  await expect(page.locator('a[href="/folder/a"]')).toBeVisible();
  await page.locator('a[href="/folder/a"]').click();
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
  expect(creates).toBe(1);
});
