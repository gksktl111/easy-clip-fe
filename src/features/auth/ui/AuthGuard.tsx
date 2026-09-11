"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { HiOutlineHome, HiOutlineRefresh } from "react-icons/hi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Button } from "@/shared/ui/button/Button";

// 인증이 필요한 경로에서 검증 결과에 따라 렌더링, redirect와 재시도를 결정합니다.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("authGuard");
  const router = useRouter();
  const { status, restoreSession } = useAuth();
  const { handleLogout, isPending: isLogoutPending } = useLogout();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "authenticated") {
    return children;
  }

  if (status === "error" || status === "logout-error") {
    const isLogoutError = status === "logout-error";
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background) px-4">
        <div
          className="flex max-w-sm flex-col items-center text-center"
          role="alert"
        >
          <p className="text-sm text-(--muted)">
            {t(isLogoutError ? "logoutFailed" : "error")}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            disabled={isLogoutPending}
            onClick={() =>
              void (isLogoutError ? handleLogout() : restoreSession())
            }
          >
            <HiOutlineRefresh className="h-4 w-4" aria-hidden />
            {t(isLogoutError ? "retryLogout" : "retry")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="mt-2"
            onClick={() => router.push("/")}
          >
            <HiOutlineHome className="h-4 w-4" aria-hidden />
            {t("backHome")}
          </Button>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    // redirect effect가 실행될 때까지 일반 인증 대기 화면을 다시 보여 주지 않습니다.
    return null;
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-(--background)"
      aria-label={t(status === "logging-out" ? "loggingOut" : "loading")}
      aria-live="polite"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-(--border) border-t-(--foreground)" />
    </main>
  );
}
