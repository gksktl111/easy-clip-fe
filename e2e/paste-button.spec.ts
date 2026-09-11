import { expect, test } from "./fixtures";
import { setup, clip } from "./access-fixture";

test.use({ viewport: { width: 390, height: 844 } });

const pasteButton = (page: import("./fixtures").Page) =>
  page.getByRole("button", { name: "붙여넣기", exact: true });

test("모바일 붙여넣기 버튼은 실제 클립보드 텍스트와 이미지를 저장한다", async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  const bodies: string[] = [];
  await page.route("**/clips", (route) => {
    bodies.push(route.request().postDataBuffer()!.toString());
    return route.fulfill({
      json: clip(`new-${bodies.length}`, "a", "새 클립"),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/folder/a");
  await expect(pasteButton(page)).toBeVisible();
  await expect(page.locator('textarea, input[type="file"]')).toHaveCount(0);
  await page.evaluate(() =>
    navigator.clipboard.writeText("버튼으로 저장한 텍스트"),
  );
  await pasteButton(page).click();
  await expect.poll(() => bodies.length).toBe(1);
  expect(bodies[0]).toContain("버튼으로 저장한 텍스트");
  await expect(pasteButton(page)).toBeEnabled();
  await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((value) => resolve(value!)),
    );
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  });
  await pasteButton(page).click();
  await expect.poll(() => bodies.length).toBe(2);
  expect(bodies[1]).toContain('filename="clipboard.png"');
  await expect(pasteButton(page)).toBeEnabled();
  await testInfo.attach("mobile-paste-button", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});

for (const mode of ["empty", "denied", "unavailable"] as const) {
  test(`클립보드 ${mode} 상황은 저장하지 않고 안내한다`, async ({ page }) => {
    await setup(page);
    let writes = 0;
    await page.route("**/clips", (route) => {
      writes++;
      return route.fulfill({ json: clip("new", "a", "새 클립") });
    });
    await page.addInitScript((value) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value:
          value === "unavailable"
            ? undefined
            : {
                read: async () => {
                  if (value === "denied")
                    throw new DOMException("Denied", "NotAllowedError");
                  return [];
                },
              },
      });
    }, mode);
    await page.goto("/folder/a");
    await pasteButton(page).click();
    const message =
      mode === "empty"
        ? "붙여넣을 내용이 없어요."
        : mode === "denied"
          ? "클립보드 접근이 허용되지 않았어요."
          : "이 브라우저는 버튼 붙여넣기를 지원하지 않아요.";
    await expect(
      page.locator("[data-sonner-toast]").filter({ hasText: message }),
    ).toBeVisible();
    await expect(pasteButton(page)).toBeEnabled();
    expect(writes).toBe(0);
  });
}

test("클립보드를 읽는 동안 중복 요청을 막고 화면 이동 후에는 저장하지 않는다", async ({
  page,
}) => {
  await setup(page);
  let writes = 0;
  await page.route("**/clips", (route) => {
    writes++;
    return route.fulfill({ json: clip("new", "a", "새 클립") });
  });
  await page.addInitScript(() => {
    const state = window as Window & {
      finishRead?: () => void;
      readCount?: number;
    };
    state.readCount = 0;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        readText: () => {
          state.readCount = (state.readCount ?? 0) + 1;
          return new Promise<string>((resolve) => {
            state.finishRead = () => resolve("오래된 입력");
          });
        },
      },
    });
  });
  await page.goto("/folder/a");
  await pasteButton(page).click();
  const busyButton = page.getByRole("button", {
    name: "저장 중…",
    exact: true,
  });
  await expect(busyButton).toBeDisabled();
  await busyButton.dispatchEvent("click");
  expect(
    await page.evaluate(
      () => (window as Window & { readCount?: number }).readCount,
    ),
  ).toBe(1);
  await page
    .getByRole("button", { name: "사이드바 열기", exact: true })
    .click();
  await page.getByRole("link", { name: "최근 항목", exact: true }).click();
  await expect(page).toHaveURL(/\/recent$/);
  await page.evaluate(async () => {
    (window as Window & { finishRead?: () => void }).finishRead?.();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  expect(writes).toBe(0);
});

test("버튼 저장 실패는 초안을 유지하고 재시도 중 추가 붙여넣기를 막는다", async ({
  page,
}) => {
  await setup(page);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  let writes = 0;
  await page.route("**/clips", (route) => {
    writes++;
    return writes === 1
      ? route.fulfill({ status: 500, json: { message: "failure" } })
      : route.fulfill({ json: clip("new", "a", "다시 저장") });
  });
  await page.goto("/folder/a");
  await page.evaluate(() => navigator.clipboard.writeText("보존할 내용"));
  await pasteButton(page).click();
  const draft = page.getByRole("region", { name: "저장하지 못한 클립" });
  await expect(draft.getByText("보존할 내용")).toBeVisible();
  await expect(pasteButton(page)).toBeDisabled();
  await draft.getByRole("button", { name: "다시 저장" }).click();
  await expect(draft).toHaveCount(0);
  await expect(pasteButton(page)).toBeEnabled();
  expect(writes).toBe(2);
});
