"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginAgreementNotice } from "@/features/auth/ui/LoginAgreementNotice";
import { LoginBrandPanel } from "@/features/auth/ui/LoginBrandPanel";
import { LoginLoadingState } from "@/features/auth/ui/LoginLoadingState";
import { LoginSocialActions } from "@/features/auth/ui/LoginSocialActions";

export function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const handleLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setLoadingProvider(provider);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/favorites");
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
