import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";
import {
  createSentryOptions,
  getSentryEnvironment,
  getSentryTraceSampleRate,
  sanitizeSentryBreadcrumb,
} from "./sentry";

describe("Sentry 설정", () => {
  it("Preview와 Production 환경에서만 이벤트 전송을 활성화한다", () => {
    expect(getSentryEnvironment("preview")).toBe("preview");
    expect(getSentryEnvironment("production")).toBe("production");
    expect(getSentryEnvironment("development")).toBeUndefined();

    expect(
      createSentryOptions({
        deploymentEnvironment: "development",
        dsn: "https://public@example.ingest.sentry.io/1",
        release: "development-release",
      }).enabled,
    ).toBe(false);
  });

  it("Preview 검증 기간에는 모든 Performance Trace를 수집한다", () => {
    expect(getSentryTraceSampleRate("preview")).toBe(1);
    expect(getSentryTraceSampleRate("production")).toBe(0.1);
    expect(getSentryTraceSampleRate(undefined)).toBe(0);
  });

  it("이벤트에서 요청과 사용자 정보를 제거하고 민감한 값을 정제한다", () => {
    const options = createSentryOptions({
      deploymentEnvironment: "production",
      dsn: "https://public@example.ingest.sentry.io/1",
      release: "commit-sha",
    });
    const event = {
      breadcrumbs: [
        {
          category: "fetch",
          data: {
            authorization: "Bearer very-secret-token",
          },
          message: "https://api.example.com?access_token=very-secret-token",
          type: "http",
        },
      ],
      extra: {
        refreshToken: "very-secret-token",
        userEmail: "person@example.com",
      },
      message: "Bearer very-secret-token for person@example.com",
      request: {
        cookies: {
          session: "very-secret-token",
        },
      },
      type: undefined,
      user: {
        email: "person@example.com",
      },
    } as ErrorEvent;

    const sanitizedEvent = options.beforeSend(event);

    expect(sanitizedEvent).not.toHaveProperty("request");
    expect(sanitizedEvent).not.toHaveProperty("user");
    expect(sanitizedEvent.extra).toEqual({
      refreshToken: "[Filtered]",
      userEmail: "[Filtered]",
    });
    expect(sanitizedEvent.message).toBe("Bearer [Filtered] for [Filtered]");
    expect(sanitizedEvent.breadcrumbs).toEqual([
      {
        category: "fetch",
        type: "http",
      },
    ]);
  });

  it("breadcrumb의 사용자 입력과 요청 부가 데이터를 전송하지 않는다", () => {
    const breadcrumb = sanitizeSentryBreadcrumb({
      category: "ui.click",
      data: {
        password: "very-secret-password",
      },
      level: "info",
      message: "person@example.com 클릭",
      timestamp: 1,
      type: "default",
    } as Breadcrumb);

    expect(breadcrumb).toEqual({
      category: "ui.click",
      level: "info",
      timestamp: 1,
      type: "default",
    });
  });
});
