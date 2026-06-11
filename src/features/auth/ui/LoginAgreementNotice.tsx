"use client";

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
