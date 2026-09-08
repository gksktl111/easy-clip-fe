import { expect, test, type Page } from "@playwright/test";

const setupWorkspace = async (page: Page) => {
  const created: string[] = [];
  let reads = 0;
  const items: Record<string, unknown>[] = [];
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.context().addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test-token",
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
  await page.route("**/folders/folder-1/tags", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/clips?**", (route) => {
    reads += 1;
    return route.fulfill({ json: { items, hasMore: false, nextCursor: null } });
  });
  await page.route("**/clips", async (route) => {
    const request = route.request();
    const form = await new Response(new Uint8Array(request.postDataBuffer()!), {
      headers: { "Content-Type": request.headers()["content-type"] },
    }).formData();
    const text = form.get("text")?.toString() ?? "이미지 클립";
    created.push(text);
    const clip = {
      id: `clip-${created.length}`,
      type: form.has("file") ? "IMAGE" : "TEXT",
      title: text,
      textContent: form.has("file") ? null : text,
      colorHex: null,
      imageUrl: form.has("file")
        ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="
        : null,
      workspaceId: "workspace-1",
      folderId: "folder-1",
      createdAt: "2026-09-08T00:00:00.000Z",
      updatedAt: "2026-09-08T00:00:00.000Z",
      deletedAt: null,
      likeByMe: false,
      tags: [],
    };
    items.push(clip);
    await route.fulfill({ status: 201, json: clip });
  });
  await page.goto("/folder/folder-1");
  const search = page.locator('input[placeholder="클립 검색..."]:visible');
  await search.click();
  await expect(
    page.getByText("붙여넣기 준비됨", { exact: true }).first(),
  ).toBeAttached();
  await page.waitForLoadState("networkidle");
  return { created, reads: () => reads, search };
};

const pasteText = async (page: Page, text: string) => {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  await page.keyboard.press("Control+V");
};

// 클립 수집의 window listener까지 이벤트가 전달된 다음 요청 유무를 확인합니다.
const settlePaste = async (page: Page) => {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await page.waitForLoadState("networkidle");
};

test("검색창 붙여넣기는 검색어만 입력하고 일반 영역에서는 클립을 한 번 생성한다", async ({
  page,
}) => {
  const state = await setupWorkspace(page);
  await pasteText(page, "검색창에만 넣을 내용");
  await expect(state.search).toHaveValue("검색창에만 넣을 내용");
  await settlePaste(page);
  expect(state.created).toEqual([]);

  await page.reload();
  await state.search.click();
  await page.waitForLoadState("networkidle");
  await page.getByText("붙여넣기 준비됨", { exact: true }).last().click();
  const initialReads = state.reads();
  await pasteText(page, "일반 영역 클립");
  await expect(
    page.getByText("일반 영역 클립", { exact: true }).first(),
  ).toBeVisible();
  await settlePaste(page);
  expect(state.created).toEqual(["일반 영역 클립"]);
  expect(state.reads()).toBe(initialReads + 1);
});

test("textarea와 contenteditable 내부 붙여넣기는 기본 입력을 유지한다", async ({
  page,
}) => {
  const state = await setupWorkspace(page);
  // 현재 페이지에 없는 편집 요소도 실제 DOM에서 상속된 편집 가능 상태로 검증합니다.
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.innerHTML =
      '<textarea aria-label="검증 입력"></textarea><div contenteditable="true" aria-label="검증 편집"><span>기존 </span></div><div contenteditable="plaintext-only" aria-label="검증 일반 텍스트"></div>';
    host.style.cssText =
      "position:fixed;top:100px;left:300px;z-index:9999;background:white";
    document.body.append(host);
  });
  const textarea = page.getByLabel("검증 입력", { exact: true });
  await textarea.focus();
  await pasteText(page, "textarea 입력");
  await expect(textarea).toHaveValue("textarea 입력");
  for (const label of ["검증 편집", "검증 일반 텍스트"]) {
    const editor = page.getByLabel(label, { exact: true });
    await editor.click();
    await page.keyboard.press("End");
    await pasteText(page, "편집 입력");
    await expect(editor).toContainText("편집 입력");
  }
  await settlePaste(page);
  expect(state.created).toEqual([]);
});

test("이미지 수집을 유지하고 태그 모달 및 삭제 모드에서는 수집하지 않는다", async ({
  page,
}) => {
  const state = await setupWorkspace(page);
  await page.getByText("붙여넣기 준비됨", { exact: true }).last().click();
  await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((value) => resolve(value!)),
    );
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  });
  await page.keyboard.press("Control+V");
  await expect.poll(() => state.created).toEqual(["이미지 클립"]);
  await expect(
    page.getByRole("button", { name: "클립 삭제", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByText("붙여넣기 준비됨", { exact: true }).first(),
  ).toBeAttached();
  await page.getByRole("button", { name: "태그 관리", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "폴더 태그 관리" }),
  ).toBeVisible();
  await pasteText(page, "모달에서 수집 금지");
  await settlePaste(page);
  expect(state.created).toEqual(["이미지 클립"]);
  await page.getByRole("button", { name: "태그 창 닫기" }).click();
  await expect(
    page.getByRole("dialog", { name: "폴더 태그 관리" }),
  ).toBeHidden();
  await page.getByRole("button", { name: "클립 삭제", exact: true }).click();
  await pasteText(page, "삭제 모드 수집 금지");
  await settlePaste(page);
  expect(state.created).toEqual(["이미지 클립"]);
});
