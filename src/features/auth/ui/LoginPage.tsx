"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAuthStartPath } from "@/features/auth/api/authApi";
import type { AuthProvider } from "@/features/auth/model/auth";
import { restoreSessionFromRefreshCookie } from "@/features/auth/service/authService";
import { buildApiUrl } from "@/shared/config/env";
import { LoginAgreementNotice } from "@/features/auth/ui/LoginAgreementNotice";
import { LoginBrandPanel } from "@/features/auth/ui/LoginBrandPanel";
import { LoginLoadingState } from "@/features/auth/ui/LoginLoadingState";
import { LoginSocialActions } from "@/features/auth/ui/LoginSocialActions";

// 세션 복구와 OAuth 진입 상태를 관리하며 로그인 UI를 조합하는 페이지입니다.
export function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasTriedCookieRestoreRef = useRef(false);

  useEffect(() => {
    if (hasTriedCookieRestoreRef.current) {
      return;
    }

    hasTriedCookieRestoreRef.current = true;

    // OAuth redirect 이후에도 URL 토큰을 저장하지 않고 쿠키 기반 내 정보 조회로 세션을 복구한다.
    void restoreSessionFromRefreshCookie()
      .then(() => router.replace("/favorites"))
      .catch(() => {
        // Stay on the login page when there is no active OAuth cookie session.
      });
  }, [router]);

  const handleLogin = async (provider: AuthProvider) => {
    try {
      setErrorMessage(null);
      setIsLoading(true);
      setLoadingProvider(provider);
      window.location.assign(buildApiUrl(getAuthStartPath(provider)));
    } catch {
      setIsLoading(false);
      setLoadingProvider(null);
      setErrorMessage(t("configError"));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-sm">
        <LoginBrandPanel title={t("title")} subtitle={t("subtitle")} />

        <LoginSocialActions
          isLoading={isLoading}
          loadingProvider={loadingProvider}
          onLogin={handleLogin}
        />

        <LoginLoadingState label={t("loading")} isVisible={isLoading} />
        {errorMessage ? (
          <p
            className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-(--border)" />
          <span className="text-xs text-(--muted)">{t("or")}</span>
          <div className="h-px flex-1 bg-(--border)" />
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-3 text-sm font-medium text-(--muted) transition-colors hover:bg-(--surface-muted) hover:text-(--foreground)"
        >
          {t("backHome")}
        </Link>

        <LoginAgreementNotice
          prefix={t("agreementPrefix")}
          middle={t("agreementMiddle")}
          suffix={t("agreementSuffix")}
          termsLabel={t("terms")}
          privacyLabel={t("privacy")}
        />
      </div>
    </main>
  );
}
