"use client";

// 소셜 로그인 진행 전에 약관 및 개인정보 처리방침 동의 안내를 표시합니다.
interface LoginAgreementNoticeProps {
  prefix: string;
  middle: string;
  suffix: string;
  termsLabel: string;
  privacyLabel: string;
}

export function LoginAgreementNotice({
  prefix,
  middle,
  suffix,
  termsLabel,
  privacyLabel,
}: LoginAgreementNoticeProps) {
  return (
    <p className="mt-8 text-center text-xs text-(--muted)">
      {prefix}{" "}
      <a href="#" className="underline hover:text-(--foreground)">
        {termsLabel}
      </a>{" "}
      {middle}{" "}
      <a href="#" className="underline hover:text-(--foreground)">
        {privacyLabel}
      </a>
      {suffix}
    </p>
  );
}
