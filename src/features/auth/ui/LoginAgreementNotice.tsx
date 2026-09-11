"use client";

import { useTranslations } from "next-intl";

export function LoginAgreementNotice() {
  const t = useTranslations("login");
  return (
    <p className="mt-8 text-center text-xs leading-6 text-(--muted)">
      {t("policiesPending")}{" "}
      <a
        href="mailto:medic6655@gmail.com"
        className="underline hover:text-(--foreground)"
      >
        {t("contact")}
      </a>
    </p>
  );
}
