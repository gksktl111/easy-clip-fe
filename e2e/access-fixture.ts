import { type Page } from "./fixtures";

export const pro = {
  plan: "PRO",
  status: "ACTIVE",
  autoRenew: true,
  currentPeriodEnd: "2099-01-01T00:00:00Z",
  nextBillingAt: null,
  provider: "TOSS_PAYMENTS",
};
export const free = { ...pro, plan: "FREE", currentPeriodEnd: null };
export const clip = (id: string, folderId: string, title: string) => ({
  id,
  folderId,
  title,
  type: "TEXT",
  textContent: `${title} 본문`,
  colorHex: null,
  imageUrl: null,
  workspaceId: "workspace",
  createdAt: "2026-09-08T00:00:00Z",
  updatedAt: "2026-09-08T00:00:00Z",
  deletedAt: null,
  likeByMe: true,
  tags: [],
});

export async function setup(page: Page, initialPro = false, locale = "ko") {
  const state = {
    userId: "user-1",
    subscription: initialPro ? { ...pro } : { ...free },
    folders: [
      { id: "a", name: "접근 폴더", order: 0, isLocked: false },
      { id: "b", name: "보관 폴더", order: 1, isLocked: !initialPro },
    ],
    reads: [] as string[],
  };
  await page.context().addCookies([
    {
      name: "easy_clip_refresh_token",
      value: "test",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page
    .context()
    .addCookies([
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
        id: state.userId,
        displayName: "사용자",
        avatarUrl: null,
        authAccounts: [],
      },
    }),
  );
  await page.route("**/users/me/settings", (r) =>
    r.fulfill({
      json: {
        id: "settings",
        userId: "user-1",
        theme: "LIGHT",
        language: locale,
      },
    }),
  );
  await page.route("**/subscriptions/me", (r) =>
    r.fulfill({ json: state.subscription }),
  );
  await page.route("**/folders", (r) => r.fulfill({ json: state.folders }));
  await page.route("**/clips?**", (r) => {
    state.reads.push(r.request().url());
    const folderId = new URL(r.request().url()).searchParams.get("folderId");
    const items = [
      clip("ca", "a", "공개 클립"),
      clip("cb", "b", "비공개 클립"),
    ].filter((c) => !folderId || c.folderId === folderId);
    return r.fulfill({ json: { items, hasMore: false, nextCursor: null } });
  });
  return state;
}
