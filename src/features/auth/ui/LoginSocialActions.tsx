"use client";

import { useTranslations } from "next-intl";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import type { AuthProvider } from "@/features/auth/model/auth";
import { SocialLoginButton } from "@/features/auth/ui/SocialLoginButton";

// 지원하는 OAuth 제공자별 로그인 액션을 동일한 버튼 구성으로 제공합니다.
interface LoginSocialActionsProps {
  isLoading: boolean;
  loadingProvider: AuthProvider | null;
  onLogin: (provider: AuthProvider) => void;
}

export function LoginSocialActions({
  isLoading,
  loadingProvider,
  onLogin,
}: LoginSocialActionsProps) {
  const t = useTranslations("login");

  return (
    <div className="space-y-3">
      <SocialLoginButton
        label={t("continueWithGoogle")}
        icon={<FcGoogle className="h-5 w-5" aria-hidden />}
        onClick={() => onLogin("google")}
        isLoading={isLoading && loadingProvider === "google"}
      />
      <SocialLoginButton
        label={t("continueWithGithub")}
        icon={<FaGithub className="h-5 w-5" aria-hidden />}
        onClick={() => onLogin("github")}
        isLoading={isLoading && loadingProvider === "github"}
      />
    </div>
  );
}
