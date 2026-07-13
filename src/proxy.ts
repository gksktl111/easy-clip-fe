import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/features/auth";

const MAIN_APP_PATH = "/favorites";
const LOGIN_PATH = "/login";

const PUBLIC_PATHS = new Set(["/", LOGIN_PATH, "/pricing"]);
const AUTH_REDIRECT_PATHS = new Set(["/"]);

const hasAuthCookie = (request: NextRequest) =>
  AUTH_COOKIE_NAMES.some((cookieName) => request.cookies.has(cookieName));

const redirectTo = (request: NextRequest, path: string) => {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = path;
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const hasAuthenticationCookie = hasAuthCookie(request);

  if (hasAuthenticationCookie && AUTH_REDIRECT_PATHS.has(pathname)) {
    // 인증 쿠키가 있으면 실제 세션 검증을 수행할 앱 경로로 먼저 보냅니다.
    return redirectTo(request, MAIN_APP_PATH);
  }

  if (!hasAuthenticationCookie && !isPublicPath) {
    // 쿠키가 전혀 없으면 앱 라우트 진입 전에 로그인 화면으로 보낸다.
    return redirectTo(request, LOGIN_PATH);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
