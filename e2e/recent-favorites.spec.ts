import { expect, test } from "@playwright/test";

test("최근 항목 3페이지에서 즐겨찾기 등록·해제·실패 재시도와 목록 동기화를 유지한다", async ({
  page,
}) => {
  const clips = Array.from({ length: 18 }, (_, index) => ({
    id: `clip-${index + 1}`,
    type: "TEXT",
    title: `검증 클립 ${index + 1}`,
    textContent: `내용 ${index + 1}`,
    colorHex: null,
    imageUrl: null,
    workspaceId: "workspace-1",
    folderId: "folder-1",
    createdAt: "2026-09-08T00:00:00.000Z",
    updatedAt: "2026-09-08T00:00:00.000Z",
    deletedAt: null,
    likeByMe: false,
    tags: [],
  }));
  const methods: string[] = [];
  let failNext = false;
  let releaseRequest: (() => void) | undefined;
  let requestGate: Promise<void> | undefined;

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
  await page.route("**/folders", (route) =>
    route.fulfill({ json: [{ id: "folder-1", name: "프로젝트", order: 0 }] }),
  );
  await page.route("**/clips?**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    const filtered =
      params.get("favorite") === "true"
        ? clips.filter((clip) => clip.likeByMe)
        : clips;
    const offset = Number(params.get("cursor") ?? 0);
    return route.fulfill({
      json: {
        items: filtered.slice(offset, offset + 6),
        hasMore: offset + 6 < filtered.length,
        nextCursor: offset + 6 < filtered.length ? String(offset + 6) : null,
      },
    });
  });
  await page.route("**/clips/clip-1/likes", async (route) => {
    methods.push(route.request().method());
    await requestGate;
    if (failNext) {
      failNext = false;
      return route.fulfill({ status: 400, json: { message: "실패" } });
    }
    clips[0].likeByMe = route.request().method() === "POST";
    return route.fulfill({ json: { likeByMe: clips[0].likeByMe } });
  });

  const button = page
    .locator("article")
    .filter({
      has: page.getByRole("button", { name: "검증 클립 1 복사", exact: true }),
    })
    .getByRole("button", { name: "즐겨찾기 전환" });

  await page.goto("/recent");
  await expect(page.locator("article")).toHaveCount(6);
  await page
    .getByRole("button", { name: "검증 클립 6 복사", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(page.locator("article")).toHaveCount(12);
  await page
    .getByRole("button", { name: "검증 클립 12 복사", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(page.locator("article")).toHaveCount(18);

  requestGate = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button.locator(".animate-spin")).toHaveCount(0);
  await button.dispatchEvent("click");
  await expect.poll(() => methods.length).toBe(1);
  releaseRequest?.();
  requestGate = undefined;
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button).toBeEnabled();
  await expect(page.locator("article")).toHaveCount(18);

  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(button).toBeEnabled();
  await expect(page.locator("article")).toHaveCount(18);
  expect(methods).toEqual(["POST", "DELETE"]);

  failNext = true;
  requestGate = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button).toBeDisabled();
  releaseRequest?.();
  requestGate = undefined;
  await expect(
    page.getByText("즐겨찾기 변경에 실패했습니다. 다시 시도해주세요."),
  ).toBeVisible();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button).toBeEnabled();
  expect(methods).toEqual(["POST", "DELETE", "POST", "POST"]);
  await expect(page.locator("article")).toHaveCount(18);

  await page.getByRole("link", { name: "즐겨찾기", exact: true }).click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("article")).toHaveCount(1);
  await page.getByRole("link", { name: "프로젝트", exact: true }).click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
});
