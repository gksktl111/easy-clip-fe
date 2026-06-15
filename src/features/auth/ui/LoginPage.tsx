"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAuthStartPath, testAdminLogin } from "@/features/auth/api/authApi";
import { persistAuthSession } from "@/features/auth/service/authSession";
import { buildApiUrl, isLocalApiBaseUrl } from "@/shared/config/env";
import { LoginAgreementNotice } from "@/features/auth/ui/LoginAgreementNotice";
import { LoginBrandPanel } from "@/features/auth/ui/LoginBrandPanel";
import { LoginLoadingState } from "@/features/auth/ui/LoginLoadingState";
import { LoginSocialActions } from "@/features/auth/ui/LoginSocialActions";

export function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectedSession = useMemo(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      user: null,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!redirectedSession) {
      return;
    }

    persistAuthSession(redirectedSession);
    router.replace("/favorites");
  }, [redirectedSession, router]);

  const handleLogin = async (provider: "google" | "github") => {
    try {
      setErrorMessage(null);
      setIsLoading(true);
      setLoadingProvider(provider);

      if (isLocalApiBaseUrl()) {
        const session = await testAdminLogin();
        persistAuthSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user: session.user,
        });
        router.replace("/favorites");
        return;
      }

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
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
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
