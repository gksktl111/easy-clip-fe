import { test, expect } from "./fixtures";
import { setup, clip } from "./access-fixture";
import ko from "../src/messages/ko.json";
import en from "../src/messages/en.json";
import ja from "../src/messages/ja.json";
import zh from "../src/messages/zh.json";
import { LOCALE_LABELS } from "../src/shared/config/locale";

for (const path of ["/folder/a", "/recent", "/favorites"]) {
  for (const fail of [false, true]) {
    test(`${path} 지연된 이미지 복사 ${fail ? "실패" : "성공"} 전에는 복사 상태를 표시하고 후속 복사는 완료 후 허용한다`, async ({
      page,
    }, testInfo) => {
      await setup(page, true);
      await page.route("**/clips?**", (r) =>
        r.fulfill({
          json: {
            items: [
              {
                ...clip("image", "a", "이미지 클립"),
                type: "IMAGE",
                textContent: null,
                imageUrl:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
              },
              clip("text", "a", "후속 클립"),
            ],
            hasMore: false,
            nextCursor: null,
          },
        }),
      );
      await page.route("**/clips/*/views", (r) => r.fulfill({ status: 204 }));
      await page.addInitScript(
        ({ fail }) => {
          const state = {
            started: false,
            release: () => {},
            writes: [] as string[],
          };
          Object.assign(window, { copyReview: state });
          Object.defineProperty(navigator.clipboard, "write", {
            value: () =>
              new Promise<void>((resolve, reject) => {
                state.started = true;
                state.release = () => {
                  if (fail) reject(new Error("denied"));
                  else {
                    state.writes.push("image");
                    resolve();
                  }
                };
              }),
          });
          Object.defineProperty(navigator.clipboard, "writeText", {
            value: async (value: string) => {
              state.writes.push(value);
            },
          });
        },
        { fail },
      );
      await page.goto(path);
      const image = page.getByRole("button", {
        name: "이미지 클립 복사",
        exact: true,
      });
      const next = page.getByRole("button", {
        name: "후속 클립 복사",
        exact: true,
      });
      await image.click();
      await expect(image).toHaveAttribute("aria-busy", "true");
      await expect(image).toBeDisabled();
      await expect(next).toBeDisabled();
      await expect(image).toContainText("복사 중");
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              (window as unknown as { copyReview: { started: boolean } })
                .copyReview.started,
          ),
        )
        .toBe(true);
      if (path === "/folder/a" && !fail)
        await page.screenshot({
          path: testInfo.outputPath("copy-pending.png"),
          animations: "disabled",
        });
      await next.evaluate((element: HTMLButtonElement) => element.click());
      await page.evaluate(() =>
        (
          window as unknown as { copyReview: { release: () => void } }
        ).copyReview.release(),
      );
      await expect(image).toBeEnabled();
      await expect(next).toBeEnabled();
      const toast = page.locator('[data-sonner-toast][data-removed="false"]');
      await expect(toast).toContainText(
        fail ? ko.feedback.copyError : ko.feedback.copySuccess,
      );
      await next.click();
      await expect(toast).toContainText(ko.feedback.copySuccess);
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { copyReview: { writes: string[] } })
              .copyReview.writes,
        ),
      ).toEqual(fail ? ["후속 클립 본문"] : ["image", "후속 클립 본문"]);
    });
  }
}

for (const [locale, messages] of Object.entries({ ko, en, ja, zh }) as Array<
  [keyof typeof LOCALE_LABELS, typeof ko]
>) {
  test(`${locale} 언어 저장 성공은 선택한 언어로 안내한다`, async ({
    page,
  }, testInfo) => {
    const initialLocale = locale === "ko" ? "en" : "ko";
    await setup(page, true, initialLocale);
    await page.route("**/users/me/settings", (r) =>
      r.request().method() === "PATCH"
        ? r.fulfill({
            json: {
              id: "settings",
              userId: "user-1",
              theme: "LIGHT",
              language: locale,
            },
          })
        : r.fallback(),
    );
    await page.goto("/folder/a");
    await page
      .getByRole("button", { name: "사용 사용자", exact: true })
      .click();
    await page
      .getByRole("button", {
        name:
          initialLocale === "en" ? en.sidebar.settings : ko.sidebar.settings,
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: LOCALE_LABELS[initialLocale], exact: true })
      .click();
    await page
      .getByRole("option", { name: LOCALE_LABELS[locale], exact: true })
      .click();
    await expect(
      page.locator('[data-sonner-toast][data-removed="false"]'),
    ).toContainText(messages.feedback.settingsSaved);
    if (locale === "en")
      await page.screenshot({
        path: testInfo.outputPath("language-saved-en.png"),
        animations: "disabled",
      });
    await expect(
      page.getByRole("button", { name: messages.feedback.close }),
    ).toBeVisible();
  });
}
