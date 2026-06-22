import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE_NAME = "easy_clip_access_token";
const REFRESH_TOKEN_COOKIE_NAME = "easy_clip_refresh_token";
const MAIN_APP_PATH = "/favorites";
const LOGIN_PATH = "/login";

const PUBLIC_PATHS = new Set(["/", LOGIN_PATH, "/pricing"]);

const hasAuthCookie = (request: NextRequest) =>
  request.cookies.has(ACCESS_TOKEN_COOKIE_NAME) ||
  request.cookies.has(REFRESH_TOKEN_COOKIE_NAME);

const redirectTo = (request: NextRequest, path: string) => {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = path;
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const isAuthenticated = hasAuthCookie(request);

  if (isAuthenticated && isPublicPath) {
    // 로그인된 사용자는 랜딩/로그인/가격 페이지 대신 메인 앱 도메인에서만 활동한다.
    return redirectTo(request, MAIN_APP_PATH);
  }

  if (!isAuthenticated && !isPublicPath) {
    // 쿠키가 전혀 없으면 앱 라우트 진입 전에 로그인 화면으로 보낸다.
    return redirectTo(request, LOGIN_PATH);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
