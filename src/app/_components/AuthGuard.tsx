"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { HiOutlineRefresh } from "react-icons/hi";
import { useSession } from "@/shared/session/useSession";
import { Button } from "@/shared/ui/button/Button";

// 인증이 필요한 경로에서 검증 결과에 따라 렌더링, redirect와 재시도를 결정합니다.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("authGuard");
  const router = useRouter();
  const { status, restoreSession } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "authenticated") {
    return children;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background) px-4">
        <div
          className="flex max-w-sm flex-col items-center text-center"
          role="alert"
        >
          <p className="text-sm text-(--muted)">{t("error")}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => void restoreSession()}
          >
            <HiOutlineRefresh className="h-4 w-4" aria-hidden />
            {t("retry")}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-(--background)"
      aria-label={t("loading")}
      aria-live="polite"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-(--border) border-t-(--foreground)" />
    </main>
  );
}
