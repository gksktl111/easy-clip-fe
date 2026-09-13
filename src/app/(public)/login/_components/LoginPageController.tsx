"use client";

import { notifyError } from "@/shared/feedback/toast";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  getAuthStartPath,
  AuthGuard,
  LoginPage,
  type OAuthProvider,
  useAuth,
} from "@/features/auth";
import { buildApiUrl } from "@/shared/config/env";

// 전역 인증 상태에 따른 redirect와 OAuth 이동을 조정하고 표시 상태만 UI에 전달합니다.
export function LoginPageController() {
  const t = useTranslations("login");
  const router = useRouter();
  const { status } = useAuth();
  const [isLoginPending, setIsLoginPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/favorites");
    }
  }, [router, status]);

  const handleLogin = (provider: OAuthProvider) => {
    try {
      setIsLoginPending(true);
      window.location.assign(buildApiUrl(getAuthStartPath(provider)));
    } catch {
      setIsLoginPending(false);
      notifyError(t("configError"));
    }
  };

  if (status === "logout-error" || status === "logging-out") {
    return <AuthGuard>{null}</AuthGuard>;
  }

  return (
    <LoginPage
      isLoading={
        isLoginPending || status === "idle" || status === "initializing"
      }
      onLogin={handleLogin}
    />
  );
}
