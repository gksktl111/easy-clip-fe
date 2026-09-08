"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ApiError } from "@/shared/lib/apiClient";
import { getPolicyLimitDetails, isPolicyError } from "./policyError";

export function PolicyErrorNotice({ error }: { error: unknown }) {
  const t = useTranslations("access");
  if (!error) return null;
  const policy = isPolicyError(error) ? error : null;
  const details = policy ? getPolicyLimitDetails(policy) : null;
  const canUpgrade =
    policy?.code === "CLIP_LIMIT_EXCEEDED"
      ? details?.upgradeCanResolve === true
      : Boolean(policy);
  const message = policy
    ? t(`errors.${policy.code}`)
    : error instanceof ApiError
      ? error.message
      : t("operationError");
  return (
    <div
      role="alert"
      className="space-y-2 rounded-lg border border-(--danger-border) bg-(--danger-surface) p-3 text-sm text-(--danger-text)"
    >
      <p>{message}</p>
      {details?.limit !== null && details?.currentCount !== null && details ? (
        <p>
          {t("limitCount", {
            count: details.currentCount,
            limit: details.limit,
          })}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {canUpgrade ? (
          <Link href="/pricing" className="underline">
            {t("plans")}
          </Link>
        ) : null}
        {policy?.code === "PLAN_LIMIT_EXCEEDED" ? (
          <Link href="/trash" className="underline">
            {t("trash")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
