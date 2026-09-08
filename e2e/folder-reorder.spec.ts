import { expect, test, type Page } from "@playwright/test";

type MoveRequest = { targetId: string; beforeId?: string; afterId?: string };

async function mockFolders(page: Page, count = 3) {
  let folders = Array.from({ length: count }, (_, index) => ({
    id: `folder-${index + 1}`,
    name: `폴더 ${index + 1}`,
    order: index,
  }));
  const requests: MoveRequest[] = [];
  let failNext = false;
  await page.context().addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test-refresh-token",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.route("**/users/me", (route) =>
    route.fulfill({
      json: {
        id: "user-1",
        displayName: "테스트 사용자",
        avatarUrl: null,
        authAccounts: [],
      },
    }),
  );
  await page.route("**/users/me/settings", (route) =>
    route.fulfill({
      json: {
        id: "settings-1",
        userId: "user-1",
        theme: "LIGHT",
        language: "ko",
      },
    }),
  );
  await page.route("**/clips?**", (route) =>
    route.fulfill({
      json: {
        items: [],
        hasMore: false,
        nextCursor: null,
      },
    }),
  );
  await page.route("**/folders", (route) => route.fulfill({ json: folders }));
  await page.route("**/folders/reorder", (route) => {
    const body = route.request().postDataJSON() as MoveRequest;
    requests.push(body);
    if (failNext) {
      failNext = false;
      return route.fulfill({ status: 400, json: { message: "정렬 실패" } });
    }
    const moved = folders.find((folder) => folder.id === body.targetId)!;
    const remaining = folders.filter((folder) => folder.id !== body.targetId);
    const anchorIndex = remaining.findIndex(
      (folder) => folder.id === (body.beforeId ?? body.afterId),
    );
    remaining.splice(body.beforeId ? anchorIndex : anchorIndex + 1, 0, moved);
    folders = remaining.map((folder, order) => ({ ...folder, order }));
    return route.fulfill({
      json: folders.find((folder) => folder.id === body.targetId),
    });
  });
  await page.goto("/recent");
  await expect(
    page.getByRole("link", { name: `폴더 ${count}`, exact: true }),
  ).toBeVisible();
  return {
    requests,
    failNext: () => {
      failNext = true;
    },
  };
}

const row = (page: Page, n: number) =>
  page.getByRole("listitem").filter({
    has: page.getByRole("link", { name: `폴더 ${n}`, exact: true }),
  });
const folderLinks = (page: Page) =>
  page.getByRole("link", { name: /^폴더 \d$/ });

test("마지막 폴더의 메뉴·키보드 위 이동과 실패 복구", async ({ page }) => {
  const mock = await mockFolders(page);
  await page.getByRole("link", { name: "폴더 1", exact: true }).focus();
  await page.keyboard.press("Control+ArrowUp");
  await page.getByRole("link", { name: "폴더 3", exact: true }).focus();
  await page.keyboard.press("Control+ArrowDown");
  expect(mock.requests).toHaveLength(0);
  await row(page, 3).getByRole("button", { name: "폴더 옵션 열기" }).click();
  await page.getByRole("button", { name: /위로 이동/ }).click();
  await expect(folderLinks(page)).toHaveText(["폴더 1", "폴더 3", "폴더 2"]);
  await expect
    .poll(() => mock.requests)
    .toEqual([{ targetId: "folder-3", beforeId: "folder-2" }]);
  await page.reload();
  await expect(folderLinks(page)).toHaveText(["폴더 1", "폴더 3", "폴더 2"]);
  await page.getByRole("link", { name: "폴더 2", exact: true }).focus();
  await page.keyboard.press("Control+ArrowUp");
  await expect(folderLinks(page)).toHaveText(["폴더 1", "폴더 2", "폴더 3"]);
  await expect.poll(() => mock.requests.length).toBe(2);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "폴더 2 폴더를 위로 이동했습니다." }),
  ).toBeVisible();
  mock.failNext();
  await page.getByRole("link", { name: "폴더 3", exact: true }).focus();
  await page.keyboard.press("Control+ArrowUp");
  await expect(
    page.getByText(
      "폴더 작업을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
    ),
  ).toBeVisible();
  await expect(folderLinks(page)).toHaveText(["폴더 1", "폴더 2", "폴더 3"]);
});

for (const count of [2, 3]) {
  test(`${count}개 폴더의 마지막 행을 바로 위 행 중앙에 드롭하면 한 칸 이동한다`, async ({
    page,
  }) => {
    const mock = await mockFolders(page, count);
    const source = row(page, count).getByRole("button", {
      name: "폴더 순서 변경",
    });
    const target = row(page, count - 1);
    await source.dragTo(target);
    const expected = Array.from(
      { length: count },
      (_, index) => `폴더 ${index + 1}`,
    );
    [expected[count - 2], expected[count - 1]] = [
      expected[count - 1],
      expected[count - 2],
    ];
    await expect(folderLinks(page)).toHaveText(expected);
    expect(mock.requests).toEqual([
      { targetId: `folder-${count}`, beforeId: `folder-${count - 1}` },
    ]);
    await page.reload();
    await expect(folderLinks(page)).toHaveText(expected);
    // 같은 행에 놓으면 저장하지 않고, 아래 행에 놓으면 다시 한 칸 내려갑니다.
    await row(page, count)
      .getByRole("button", { name: "폴더 순서 변경" })
      .dragTo(row(page, count));
    await expect(folderLinks(page)).toHaveText(expected);
    await row(page, count)
      .getByRole("button", { name: "폴더 순서 변경" })
      .dragTo(row(page, count - 1));
    await expect(folderLinks(page)).toHaveText(
      Array.from({ length: count }, (_, index) => `폴더 ${index + 1}`),
    );
    expect(mock.requests).toEqual([
      { targetId: `folder-${count}`, beforeId: `folder-${count - 1}` },
      { targetId: `folder-${count}`, afterId: `folder-${count - 1}` },
    ]);
  });
}
