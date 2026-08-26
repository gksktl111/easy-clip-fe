"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  getAuthStartPath,
  LoginPage,
  type OAuthProvider,
} from "@/features/auth";
import { buildApiUrl } from "@/shared/config/env";
import { useAuth } from "@/shared/auth/useAuth";

// 전역 인증 상태에 따른 redirect와 OAuth 이동을 조정하고 표시 상태만 UI에 전달합니다.
export function LoginPageController() {
  const t = useTranslations("login");
  const router = useRouter();
  const { status } = useAuth();
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/favorites");
    }
  }, [router, status]);

  const handleLogin = (provider: OAuthProvider) => {
    try {
      setErrorMessage(null);
      setIsLoginPending(true);
      window.location.assign(buildApiUrl(getAuthStartPath(provider)));
    } catch {
      setIsLoginPending(false);
      setErrorMessage(t("configError"));
    }
  };

  return (
    <LoginPage
      errorMessage={errorMessage}
      isLoading={
        isLoginPending || status === "idle" || status === "initializing"
      }
      onLogin={handleLogin}
    />
  );
}
