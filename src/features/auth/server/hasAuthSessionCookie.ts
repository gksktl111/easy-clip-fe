import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES } from "@/features/auth/model/authCookie";

// 쿠키 존재 여부는 초기화 힌트로만 사용하고 실제 세션 유효성은 SessionProvider가 검증합니다.
export async function hasAuthSessionCookie() {
  const cookieStore = await cookies();
  return AUTH_COOKIE_NAMES.some((cookieName) => cookieStore.has(cookieName));
}
