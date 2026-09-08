import { expect, test, type Page } from "./fixtures";

interface MockFolderTag {
  id: string;
  name: string;
  backgroundColor:
    | "GRAY"
    | "BROWN"
    | "ORANGE"
    | "YELLOW"
    | "GREEN"
    | "BLUE"
    | "PURPLE"
    | "PINK"
    | "RED";
  folderId: string;
}

const addAuthCookie = (page: Page) =>
  page.context().addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test-refresh-token",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

const mockWorkspaceRequests = async (
  page: Page,
  folderTags: MockFolderTag[],
) => {
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
    route.fulfill({
      json: [{ id: "folder-1", name: "프로젝트", order: 0, isLocked: false }],
    }),
  );
  await page.route("**/clips?**", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: "clip-1",
            type: "TEXT",
            title: "테스트 클립",
            textContent: "태그 API 테스트",
            colorHex: null,
            imageUrl: null,
            workspaceId: "workspace-1",
            folderId: "folder-1",
            createdAt: "2026-09-06T00:00:00.000Z",
            updatedAt: "2026-09-06T00:00:00.000Z",
            deletedAt: null,
            likeByMe: false,
            tags: [folderTags[0]],
          },
        ],
        hasMore: false,
        nextCursor: null,
      },
    }),
  );
};

test("클립 태그를 선택하고 회색 자동 생성·색상 지정 생성 후 전체 교체 저장한다", async ({
  page,
}) => {
  const folderTags: MockFolderTag[] = [
    {
      id: "tag-red",
      name: "중요",
      backgroundColor: "RED",
      folderId: "folder-1",
    },
    {
      id: "tag-blue",
      name: "나중에 보기",
      backgroundColor: "BLUE",
      folderId: "folder-1",
    },
  ];
  const replacedTagRequests: string[][] = [];
  let coloredTagRequest: unknown = null;

  await addAuthCookie(page);
  await mockWorkspaceRequests(page, folderTags);
  await page.route("**/folders/folder-1/tags", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ json: folderTags });
    }

    coloredTagRequest = await route.request().postDataJSON();
    const coloredTag: MockFolderTag = {
      id: "tag-purple",
      name: "고객",
      backgroundColor: "PURPLE",
      folderId: "folder-1",
    };
    folderTags.push(coloredTag);
    return route.fulfill({ status: 201, json: coloredTag });
  });
  await page.route("**/clips/clip-1/tags", async (route) => {
    const tagNames: string[] = (await route.request().postDataJSON()).tags;
    replacedTagRequests.push(tagNames);

    if (
      !folderTags.some((tag) => tag.name === "자료 조사") &&
      tagNames.includes("자료 조사")
    ) {
      folderTags.push({
        id: "tag-gray",
        name: "자료 조사",
        backgroundColor: "GRAY",
        folderId: "folder-1",
      });
    }

    return route.fulfill({
      json: {
        tags: tagNames.flatMap((name) => {
          const tag = folderTags.find((candidate) => candidate.name === name);
          return tag ? [tag] : [];
        }),
      },
    });
  });

  await page.goto("/folder/folder-1");
  await page.getByRole("button", { name: "테스트 클립 옵션 열기" }).click();
  await page
    .locator("[data-clip-menu]")
    .getByRole("button", { name: "태그 편집", exact: true })
    .click();

  const editor = page.getByRole("dialog", { name: "클립 태그 편집" });
  await expect(
    editor
      .locator('[data-tag-color="RED"]')
      .filter({ hasText: "중요" })
      .first(),
  ).toBeVisible();
  await editor.getByRole("button", { name: "나중에 보기" }).click();
  await editor
    .getByPlaceholder("태그 검색 또는 새 태그 입력")
    .fill("자료 조사");
  await editor.getByRole("button", { name: "“자료 조사” 바로 추가" }).click();
  await editor.getByPlaceholder("태그 검색 또는 새 태그 입력").fill("고객");
  await editor.getByRole("radio", { name: "보라색" }).click();
  await editor.getByRole("button", { name: "색상으로 만들기" }).click();
  await editor.getByRole("button", { name: "저장", exact: true }).click();

  await expect(editor).toBeHidden();
  expect(coloredTagRequest).toEqual({
    name: "고객",
    backgroundColor: "PURPLE",
  });
  expect(replacedTagRequests[0]).toEqual([
    "중요",
    "나중에 보기",
    "자료 조사",
    "고객",
  ]);

  await page.getByRole("button", { name: "테스트 클립 태그 편집" }).click();
  const reopenedEditor = page.getByRole("dialog", { name: "클립 태그 편집" });
  const createdTagChip = reopenedEditor
    .getByRole("button", { name: "자료 조사 태그 해제" })
    .locator("..");
  await expect(createdTagChip).toHaveAttribute("data-tag-color", "GRAY");

  for (const name of ["중요", "나중에 보기", "자료 조사", "고객"]) {
    await reopenedEditor
      .getByRole("button", { name: `${name} 태그 해제` })
      .click();
  }
  await reopenedEditor
    .getByRole("button", { name: "저장", exact: true })
    .click();

  await expect(page.getByText("태그 없음", { exact: true })).toBeVisible();
  expect(replacedTagRequests[1]).toEqual([]);
});

test("폴더 태그의 색상 생성·수정·삭제와 입력 오류를 관리한다", async ({
  page,
}) => {
  const folderTags: MockFolderTag[] = [
    {
      id: "tag-red",
      name: "중요",
      backgroundColor: "RED",
      folderId: "folder-1",
    },
  ];
  const requests: Array<{ method: string; body?: unknown }> = [];

  await addAuthCookie(page);
  await mockWorkspaceRequests(page, folderTags);
  await page.route("**/folders/folder-1/tags", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({ json: folderTags });
    }

    if (method === "POST") {
      const body = await route.request().postDataJSON();
      requests.push({ method, body });

      if (body.name === "중요") {
        return route.fulfill({
          status: 409,
          json: { message: "이미 존재하는 태그입니다." },
        });
      }

      const createdTag: MockFolderTag = {
        id: "tag-project",
        name: body.name,
        backgroundColor: body.backgroundColor,
        folderId: "folder-1",
      };
      folderTags.push(createdTag);
      return route.fulfill({ status: 201, json: createdTag });
    }

    return route.fallback();
  });
  await page.route("**/folders/folder-1/tags/tag-project", async (route) => {
    const method = route.request().method();
    if (method === "PATCH") {
      const body = await route.request().postDataJSON();
      requests.push({ method, body });
      folderTags[1] = { ...folderTags[1], ...body };
      return route.fulfill({ json: folderTags[1] });
    }

    if (method === "DELETE") {
      requests.push({ method });
      folderTags.splice(1, 1);
      return route.fulfill({ status: 200, body: "" });
    }

    return route.fallback();
  });

  await page.goto("/folder/folder-1");
  await page.getByRole("button", { name: "태그 관리" }).click();

  const manager = page.getByRole("dialog", { name: "폴더 태그 관리" });
  await manager.getByRole("button", { name: "새 태그" }).click();
  await page.keyboard.press("Escape");
  await expect(manager).toBeVisible();
  await expect(manager.getByLabel("태그 이름")).toHaveCount(0);

  await manager.getByRole("button", { name: "새 태그" }).click();
  const nameInput = manager.getByLabel("태그 이름");

  await nameInput.fill("   ");
  await manager.getByRole("button", { name: "생성", exact: true }).click();
  await expect(
    manager.getByText("공백만으로 된 이름은 사용할 수 없습니다."),
  ).toBeVisible();

  await nameInput.fill("12345678901");
  await manager.getByRole("button", { name: "생성", exact: true }).click();
  await expect(
    manager.getByText("태그 이름은 10자까지 입력할 수 있습니다."),
  ).toBeVisible();

  await nameInput.fill("중요");
  await manager.getByRole("button", { name: "생성", exact: true }).click();
  await expect(
    manager.getByText("같은 이름의 태그가 이미 있습니다."),
  ).toBeVisible();

  await nameInput.fill("프로젝트");
  await manager.getByRole("radio", { name: "파란색" }).click();
  await manager.getByRole("button", { name: "생성", exact: true }).click();
  await expect(manager.getByText("프로젝트", { exact: true })).toBeVisible();

  await manager.getByRole("button", { name: "프로젝트 태그 수정" }).click();
  await manager.getByLabel("태그 이름").fill("업무");
  await manager.getByRole("radio", { name: "주황색" }).click();
  await manager.getByRole("button", { name: "저장", exact: true }).click();
  await expect(manager.getByText("업무", { exact: true })).toBeVisible();

  await manager.getByRole("button", { name: "업무 태그 삭제" }).click();
  const confirm = page.getByText(
    "“업무” 태그가 적용된 모든 클립에서도 태그가 제거됩니다.",
  );
  await expect(confirm).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(confirm).toBeHidden();
  await expect(manager).toBeVisible();
  await expect(manager.getByText("업무", { exact: true })).toBeVisible();

  await manager.getByRole("button", { name: "업무 태그 삭제" }).click();
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(manager.getByText("업무", { exact: true })).toHaveCount(0);

  expect(requests).toEqual([
    { method: "POST", body: { name: "중요", backgroundColor: "GRAY" } },
    {
      method: "POST",
      body: { name: "프로젝트", backgroundColor: "BLUE" },
    },
    {
      method: "PATCH",
      body: { name: "업무", backgroundColor: "ORANGE" },
    },
    { method: "DELETE" },
  ]);
});

test("클립 태그 저장 404에서 최신 클립 목록을 다시 불러온다", async ({
  page,
}) => {
  const folderTags: MockFolderTag[] = [
    {
      id: "tag-red",
      name: "중요",
      backgroundColor: "RED",
      folderId: "folder-1",
    },
  ];
  let clipListRequestCount = 0;

  await addAuthCookie(page);
  await mockWorkspaceRequests(page, folderTags);
  await page.route("**/clips?**", (route) => {
    clipListRequestCount += 1;
    return route.fulfill({
      json: {
        items:
          clipListRequestCount === 1
            ? [
                {
                  id: "clip-1",
                  type: "TEXT",
                  title: "테스트 클립",
                  textContent: "태그 API 테스트",
                  colorHex: null,
                  imageUrl: null,
                  workspaceId: "workspace-1",
                  folderId: "folder-1",
                  createdAt: "2026-09-06T00:00:00.000Z",
                  updatedAt: "2026-09-06T00:00:00.000Z",
                  deletedAt: null,
                  likeByMe: false,
                  tags: folderTags,
                },
              ]
            : [],
        hasMore: false,
        nextCursor: null,
      },
    });
  });
  await page.route("**/folders/folder-1/tags", (route) =>
    route.fulfill({ json: folderTags }),
  );
  await page.route("**/clips/clip-1/tags", (route) =>
    route.fulfill({
      status: 404,
      json: { message: "클립을 찾을 수 없습니다." },
    }),
  );

  await page.goto("/folder/folder-1");
  await page.getByRole("button", { name: "테스트 클립 태그 편집" }).click();

  const editor = page.getByRole("dialog", { name: "클립 태그 편집" });
  await editor.getByRole("button", { name: "저장", exact: true }).click();

  await expect(
    page
      .locator("[data-sonner-toast]")
      .getByText("목록을 확인하고 다시 시도해주세요.", { exact: false }),
  ).toBeVisible();
  await expect.poll(() => clipListRequestCount).toBeGreaterThan(1);

  await editor.getByRole("button", { name: "태그 창 닫기" }).click();
  await expect(page.getByText("테스트 클립", { exact: true })).toHaveCount(0);
});

test("옵션에서 클립 이름만 변경하고 실패 시 입력을 유지하며 다시 저장한다", async ({
  page,
}) => {
  await addAuthCookie(page);
  await mockWorkspaceRequests(page, []);
  let title = "테스트 클립";
  let attempts = 0;
  let listReads = 0;
  const clip = () => ({
    id: "clip-1",
    type: "TEXT",
    title,
    textContent: "변하지 않는 본문",
    colorHex: null,
    imageUrl: null,
    workspaceId: "workspace-1",
    folderId: "folder-1",
    createdAt: "2026-09-06T00:00:00.000Z",
    updatedAt: "2026-09-06T00:00:00.000Z",
    deletedAt: null,
    likeByMe: true,
    tags: [
      {
        id: "tag-1",
        name: "중요",
        backgroundColor: "RED",
        folderId: "folder-1",
      },
    ],
  });
  await page.route("**/clips?**", (route) => {
    listReads += 1;
    return route.fulfill({
      json: {
        items: [clip(), { ...clip(), id: "clip-2", title: "다른 클립" }],
        hasMore: false,
        nextCursor: null,
      },
    });
  });
  await page.route("**/clips/clip-1", async (route) => {
    expect(route.request().method()).toBe("PATCH");
    const body = route.request().postData() ?? "";
    expect(body.match(/name="[^"]+"/g)).toEqual(['name="title"']);
    expect(body).toContain("새 클립 이름");
    attempts += 1;
    if (attempts === 1) {
      return route.fulfill({ status: 500, json: { message: "오류" } });
    }
    title = "새 클립 이름";
    return route.fulfill({ json: clip() });
  });
  await page.goto("/folder/folder-1");
  await page.getByRole("button", { name: "테스트 클립 옵션 열기" }).click();
  await page
    .locator("[data-clip-menu]")
    .getByRole("button", { name: "이름 변경", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "클립 이름 변경" });
  const input = dialog.getByLabel("클립 이름", { exact: true });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("테스트 클립");
  await input.fill("   ");
  await expect(
    dialog.getByRole("button", { name: "변경", exact: true }),
  ).toBeDisabled();
  await input.press("Enter");
  expect(attempts).toBe(0);
  await input.fill("1234567890123456");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(dialog.getByText("16/15자", { exact: true })).toBeVisible();
  await expect(
    dialog.getByText("이름은 앞뒤 공백을 제외하고 15자 이내로 입력해주세요."),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "변경", exact: true }),
  ).toBeDisabled();
  await input.press("Enter");
  expect(attempts).toBe(0);
  await input.fill("  123456789012345  ");
  await expect(input).toHaveAttribute("aria-invalid", "false");
  await expect(dialog.getByText("15/15자", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "변경", exact: true }),
  ).toBeEnabled();
  await input.fill("  새 클립 이름  ");
  await dialog.getByRole("button", { name: "변경", exact: true }).click();
  await expect(
    page.getByText("클립 이름을 변경하지 못했습니다. 다시 시도해주세요.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(input).toHaveValue("  새 클립 이름  ");
  await input.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "새 클립 이름 옵션 열기" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "다른 클립 옵션 열기" }),
  ).toBeVisible();
  await expect(
    page.getByText("변하지 않는 본문", { exact: true }).first(),
  ).toBeVisible();
  expect(attempts).toBe(2);
  expect(listReads).toBeGreaterThan(1);
});
