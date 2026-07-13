"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { AuthProvider } from "@/features/auth/model/auth";
import { LoginAgreementNotice } from "@/features/auth/ui/LoginAgreementNotice";
import { LoginBrandPanel } from "@/features/auth/ui/LoginBrandPanel";
import { LoginLoadingState } from "@/features/auth/ui/LoginLoadingState";
import { LoginSocialActions } from "@/features/auth/ui/LoginSocialActions";

interface LoginPageProps {
  errorMessage: string | null;
  isLoading: boolean;
  onLogin: (provider: AuthProvider) => void;
}

// 로그인 상태와 사용자 동작을 전달받아 로그인 화면을 렌더링합니다.
export function LoginPage({
  errorMessage,
  isLoading,
  onLogin,
}: LoginPageProps) {
  const t = useTranslations("login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-sm">
        <LoginBrandPanel title={t("title")} subtitle={t("subtitle")} />

        <LoginSocialActions disabled={isLoading} onLogin={onLogin} />

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
