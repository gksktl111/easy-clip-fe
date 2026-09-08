import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("404와 인증 경로 구분", () => {
  it.each([
    "/favorites",
    "/recent",
    "/trash",
    "/folder/id",
    "/billing",
    "/billing/success",
    "/billing/fail",
    "/folder/id/",
  ])("비로그인 %s는 로그인으로 이동한다", (path) => {
    const response = proxy(new NextRequest(`http://localhost${path}`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toMatch(
      /^http:\/\/localhost\/login\/?$/,
    );
  });
  it.each([
    "/",
    "/login",
    "/pricing",
    "/missing",
    "/folder",
    "/folder/id/missing",
    "/billing/missing",
    "/favorites/missing",
  ])("%s는 라우터가 공개 페이지 또는 404로 처리한다", (path) => {
    expect(
      proxy(new NextRequest(`http://localhost${path}`)).headers.get("location"),
    ).toBeNull();
  });
  it("인증 쿠키가 있는 오타 URL을 강제로 앱으로 보내지 않는다", () => {
    const response = proxy(
      new NextRequest("http://localhost/missing", {
        headers: { cookie: "easy_clip_refresh_token=test-token" },
      }),
    );
    expect(response.headers.get("location")).toBeNull();
  });
});
