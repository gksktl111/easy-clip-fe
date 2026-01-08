"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiOutlineClipboardCopy } from "react-icons/hi";

// 소셜 로그인 버튼 Props 타입
interface ISocialButtonProps {
  provider: "google" | "github";
  onClick: () => void;
  isLoading: boolean;
}

// Google 아이콘 컴포넌트
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// GitHub 아이콘 컴포넌트
const GithubIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

// 소셜 로그인 버튼 컴포넌트
const SocialButton = ({ provider, onClick, isLoading }: ISocialButtonProps) => {
  const config = {
    google: {
      label: "Google로 계속하기",
      icon: <GoogleIcon />,
      className:
        "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
    },
    github: {
      label: "GitHub로 계속하기",
      icon: <GithubIcon />,
      className:
        "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
    },
  };

  const { label, icon, className } = config[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("google");

    // TODO: NestJS 백엔드 OAuth 엔드포인트로 리다이렉트
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

    // 임시: 로그인 성공 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/favorites");
  };

  // GitHub 로그인 핸들러
  const handleGithubLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("github");

    // TODO: NestJS 백엔드 OAuth 엔드포인트로 리다이렉트
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;

    // 임시: 로그인 성공 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/favorites");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      {/* 로그인 카드 */}
      <div className="w-full max-w-sm">
        {/* 로고 및 브랜딩 */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]">
            <HiOutlineClipboardCopy className="h-6 w-6 text-[var(--primary-foreground)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            EasyClip에 로그인
          </h1>
          <p className="mt-2 text-center text-sm text-[var(--muted)]">
            어디서든 복사하고, 어디서나 붙여넣기
          </p>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-3">
          <SocialButton
            provider="google"
            onClick={handleGoogleLogin}
            isLoading={isLoading && loadingProvider === "google"}
          />
          <SocialButton
            provider="github"
            onClick={handleGithubLogin}
            isLoading={isLoading && loadingProvider === "github"}
          />
        </div>

        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>로그인 중...</span>
          </div>
        )}

        {/* 구분선 */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">또는</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* 홈으로 돌아가기 */}
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
        >
          홈으로 돌아가기
        </Link>

        {/* 약관 안내 */}
        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          계속하면{" "}
          <a href="#" className="underline hover:text-[var(--foreground)]">
            이용약관
          </a>{" "}
          및{" "}
          <a href="#" className="underline hover:text-[var(--foreground)]">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}
