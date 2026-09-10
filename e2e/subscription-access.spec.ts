import { expect, test } from "./fixtures";
import { setup, pro, free, clip } from "./access-fixture";

for (const resource of ["clips", "trash"] as const) {
  test(`${resource}의 만료된 다음 페이지 커서는 버리고 첫 페이지부터 다시 조회한다`, async ({
    page,
  }) => {
    await setup(page);
    const cursors: (string | null)[] = [];
    await page.route(`**/${resource}?**`, (route) => {
      const params = new URL(route.request().url()).searchParams;
      if (params.has("_rsc")) return route.fallback();
      const cursor = params.get("cursor");
      cursors.push(cursor);
      if (cursor)
        return route.fulfill({
          status: 404,
          json: { message: "접근 범위 밖 커서" },
        });
      const first = cursors.length === 1;
      return route.fulfill({
        json: {
          items: first
            ? resource === "clips"
              ? [clip("old", "a", "이전 페이지 항목")]
              : [
                  {
                    itemType: "FOLDER",
                    id: "old",
                    name: "이전 페이지 항목",
                    deletedAt: "2026-09-08T00:00:00Z",
                  },
                ]
            : [],
          ...(resource === "clips"
            ? { hasMore: first }
            : { hasNextPage: first }),
          nextCursor: first ? "server-cursor-not-item-id" : null,
        },
      });
    });
    await page.goto(resource === "clips" ? "/folder/a" : "/trash");
    await expect
      .poll(() => cursors)
      .toEqual([null, "server-cursor-not-item-id", null]);
    await expect(
      page.getByText("이전 페이지 항목", { exact: true }),
    ).toHaveCount(0);
  });
}

test("Free 잠긴 폴더는 딥링크·검색·즐겨찾기에서 콘텐츠를 노출하지 않는다", async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto("/folder/b");
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  expect(state.reads).toHaveLength(0);
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "폴더 순서 변경" }).first(),
  ).toBeDisabled();
  await page.goto("/favorites");
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "폴더 추가", exact: true }).click();
  await expect(
    page.getByText("Free에서는 폴더 1개를 사용할 수 있습니다.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const closeNotice = page.getByRole("button", { name: "폴더 추가 안내 닫기" });
  const notice = closeNotice.locator("../..");
  await expect(
    notice.getByRole("link", { name: "휴지통에서 복구" }),
  ).toHaveCount(0);
  const planLink = notice.getByRole("link", { name: "Pro 요금제 보기" });
  const retryButton = notice.getByRole("button", { name: "다시 확인" });
  const planBounds = await planLink.boundingBox();
  const retryBounds = await retryButton.boundingBox();
  expect(Math.abs(planBounds!.y - retryBounds!.y)).toBeLessThan(2);
  expect(
    await planLink.evaluate(
      (element) => getComputedStyle(element).textDecorationLine,
    ),
  ).toContain("underline");
  await closeNotice.click();
  await expect(closeNotice).toHaveCount(0);
});

test("isLocked 누락 또는 구독 조회 실패 시 임의로 콘텐츠를 개방하지 않는다", async ({
  page,
}) => {
  const state = await setup(page, true);
  await page.route("**/folders", (r) =>
    r.fulfill({ json: [{ id: "a", name: "폴더", order: 0 }] }),
  );
  await page.goto("/folder/a");
  await expect(
    page.getByRole("heading", { name: "폴더 상태를 확인할 수 없습니다" }),
  ).toBeVisible();
  expect(state.reads).toHaveLength(0);
  await page.route("**/folders", (r) => r.fulfill({ json: state.folders }));
  await page.route("**/subscriptions/me", (r) =>
    r.fulfill({ status: 500, json: { message: "오류" } }),
  );
  await page.getByRole("button", { name: "다시 확인", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "권한을 확인하지 못했습니다" }),
  ).toBeVisible();
  expect(state.reads).toHaveLength(0);
});

test("접근 폴더 삭제 후 다른 폴더를 개방하지 않고 빈 목록에서도 복구 필요 오류를 처리한다", async ({
  page,
}) => {
  const state = await setup(page);
  state.folders = [state.folders[1]];
  await page.goto("/folder/b");
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  state.folders = [];
  await page.route("**/folders", (r) =>
    r.request().method() === "POST"
      ? r.fulfill({
          status: 409,
          json: {
            code: "PLAN_LIMIT_EXCEEDED",
            message: "선택 폴더를 휴지통에서 복구해주세요.",
          },
        })
      : r.fulfill({ json: state.folders }),
  );
  await page.goto("/recent");
  await expect(
    page.getByRole("heading", { name: "권한을 확인하고 있습니다" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "폴더 추가", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("새 폴더");
  await dialog.getByRole("button", { name: "생성", exact: true }).click();
  await expect(
    page.getByText("선택 폴더를 휴지통에서 복구해주세요.", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("textbox")).toHaveValue("새 폴더");
});

test("앱 복귀 시 권한 변경을 확인하고 지연된 Pro 콘텐츠 응답을 버린다", async ({
  page,
}) => {
  const state = await setup(page, true);
  let release!: () => void;
  let requested = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/clips?**", async (r) => {
    requested = true;
    await gate;
    await r
      .fulfill({
        json: {
          items: [clip("cb", "b", "늦은 비공개 내용")],
          hasMore: false,
          nextCursor: null,
        },
      })
      .catch(() => {});
  });
  await page.goto("/folder/b");
  await expect.poll(() => requested).toBe(true);
  state.subscription = { ...free };
  state.folders[1].isLocked = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  release();
  await expect(page.getByText("늦은 비공개 내용", { exact: true })).toHaveCount(
    0,
  );
  state.subscription = { ...pro };
  state.folders[1].isLocked = false;
  await page.getByRole("button", { name: "다시 확인", exact: true }).click();
  await expect(
    page.getByText("늦은 비공개 내용", { exact: true }),
  ).toBeVisible();
});

test("추가 저장 한도 오류는 입력을 보존하고 업그레이드 해결 가능 여부를 따른다", async ({
  page,
}) => {
  await setup(page);
  let requests = 0;
  let allow = false;
  await page.route("**/clips", (r) => {
    requests += 1;
    return allow
      ? r.fulfill({ json: clip("new", "a", "새 클립") })
      : r.fulfill({
          status: 409,
          json: {
            code: "CLIP_LIMIT_EXCEEDED",
            message: "한도 초과",
            details: {
              resource: "clips",
              folderId: "a",
              limit: 50,
              currentCount: 300,
              upgradeCanResolve: false,
            },
          },
        });
  });
  await page.goto("/folder/a");
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();
  await page.getByText("공개 클립", { exact: true }).click();
  await page.evaluate(() => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "잃으면 안 되는 입력");
    document.body.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData }),
    );
  });
  const draft = page.getByRole("region", { name: "저장하지 못한 클립" });
  await expect(draft.getByText("잃으면 안 되는 입력")).toBeVisible();
  await expect(
    draft.getByRole("link", { name: "Pro 요금제 보기" }),
  ).toHaveCount(0);
  expect(requests).toBe(1);
  await page.evaluate(() => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "기존 입력을 덮어쓰면 안 되는 내용");
    document.body.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData }),
    );
  });
  await expect(draft.getByText("잃으면 안 되는 입력")).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole("link", { name: "최근 항목", exact: true }).click();
  await expect(page).toHaveURL(/\/recent$/);
  await page.locator('a[href="/folder/a"]').click();
  await expect(draft.getByText("잃으면 안 되는 입력")).toBeVisible();
  allow = true;
  await draft.getByRole("button", { name: "다시 저장" }).click();
  await expect(draft).toHaveCount(0);
  expect(requests).toBe(2);
});

test("숨겨진 항목만 있는 휴지통도 전체 비우기와 서버 처리 개수 안내를 제공한다", async ({
  page,
}) => {
  await setup(page);
  let deletes = 0;
  await page.route("**/trash?**", (r) =>
    r.fulfill({ json: { items: [], hasNextPage: false, nextCursor: null } }),
  );
  await page.route("**/trash", (r) => {
    if (r.request().method() !== "DELETE") return r.fallback();
    deletes += 1;
    return r.fulfill({
      json: { clipsDeleted: 3, foldersDeleted: 0, totalDeleted: 3 },
    });
  });
  await page.goto("/trash");
  await expect(page.getByText("표시할 휴지통 항목이 없습니다")).toBeVisible();
  await page.getByRole("button", { name: "전체 삭제", exact: true }).click();
  await expect(
    page.getByText(
      "현재 보이지 않는 잠긴 폴더의 삭제 항목도 영구 삭제됩니다.",
      { exact: false },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "전체 삭제", exact: true })
    .last()
    .click();
  await expect(page.getByText("항목 3개를 영구 삭제했습니다.")).toBeVisible();
  expect(deletes).toBe(1);
});

test("한도 초과 이미지 파일은 화면 이동 후에도 명시적으로 다시 저장할 수 있다", async ({
  page,
}) => {
  await setup(page);
  const bodies: string[] = [];
  await page.route("**/clips", (route) => {
    bodies.push(route.request().postDataBuffer()!.toString());
    return bodies.length === 1
      ? route.fulfill({
          status: 409,
          json: {
            code: "CLIP_LIMIT_EXCEEDED",
            message: "한도 초과",
            details: { limit: 50, currentCount: 50, upgradeCanResolve: true },
          },
        })
      : route.fulfill({ json: clip("saved", "a", "이미지 저장 완료") });
  });
  await page.goto("/folder/a");
  await page.getByText("공개 클립", { exact: true }).click();
  await page.evaluate(() => {
    const clipboardData = new DataTransfer();
    clipboardData.items.add(
      new File(["preserved-image-bytes"], "draft.png", { type: "image/png" }),
    );
    document.body.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData }),
    );
  });
  const draft = page.getByRole("region", { name: "저장하지 못한 클립" });
  await expect(draft.getByText("draft.png")).toBeVisible();
  await expect(
    draft.getByRole("link", { name: "Pro 요금제 보기" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "최근 항목", exact: true }).click();
  await expect(page).toHaveURL(/\/recent$/);
  await page.locator('a[href="/folder/a"]').click();
  await expect(draft.getByText("draft.png")).toBeVisible();
  expect(bodies).toHaveLength(1);
  await draft.getByRole("button", { name: "다시 저장" }).click();
  await expect(draft).toHaveCount(0);
  expect(bodies).toHaveLength(2);
  for (const body of bodies) {
    expect(body).toContain('filename="draft.png"');
    expect(body).toContain("preserved-image-bytes");
  }
});

test("열린 화면에서 Pro가 만료되면 폴더 권한을 다시 확인한다", async ({
  page,
}) => {
  await page.clock.install();
  const state = await setup(page, true);
  state.subscription.currentPeriodEnd = new Date(
    Date.now() + 60_000,
  ).toISOString();
  await page.goto("/folder/b");
  await expect(page.getByText("비공개 클립", { exact: true })).toBeVisible();
  state.subscription = { ...free };
  state.folders[1].isLocked = true;
  await page.clock.fastForward(61_000);
  await expect(
    page.getByRole("heading", { name: "잠긴 폴더입니다" }),
  ).toBeVisible();
  await expect(page.getByText("비공개 클립", { exact: true })).toHaveCount(0);
});

test("모바일에서 텍스트 입력과 이미지 선택으로 클립을 추가한다", async ({
  page,
}) => {
  await setup(page);
  let requests = 0;
  await page.route("**/clips", (route) => {
    requests += 1;
    return route.fulfill({ json: clip(`new-${requests}`, "a", "새 클립") });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/folder/a");
  await expect(page.getByText("공개 클립", { exact: true })).toBeVisible();

  const textInput = page.getByPlaceholder(
    "저장할 텍스트를 붙여넣거나 입력하세요.",
  );
  await textInput.fill("모바일에서 작성한 클립");
  await page.getByRole("button", { name: "텍스트 저장", exact: true }).click();
  await expect(textInput).toHaveValue("");

  await page.locator('input[type="file"]').setInputFiles({
    name: "mobile.png",
    mimeType: "image/png",
    buffer: Buffer.from("image-bytes"),
  });
  await expect.poll(() => requests).toBe(2);
});
