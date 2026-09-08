const protectedPaths = new Set([
  "/favorites",
  "/recent",
  "/trash",
  "/billing",
  "/billing/success",
  "/billing/fail",
]);

// 미등록 URL은 Next.js의 404로 보내고 실제 앱 경로에만 인증을 요구합니다.
export const isProtectedPath = (pathname: string) => {
  const path = pathname.replace(/\/$/, "") || "/";
  return protectedPaths.has(path) || /^\/folder\/[^/]+$/.test(path);
};
