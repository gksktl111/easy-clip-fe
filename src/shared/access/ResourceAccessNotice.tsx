"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useResourceAccess } from "./ResourceAccessContext";
import { Button } from "@/shared/ui/button/Button";

export function ResourceAccessNotice({ locked = false }: { locked?: boolean }) {
  const access = useResourceAccess();
  const t = useTranslations("access");
  const state = locked ? "locked" : access.status;
  return (
    <div
      className="flex h-full min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
      role="status"
    >
      <HiOutlineLockClosed className="h-8 w-8 text-(--muted)" aria-hidden />
      <h2 className="text-lg font-semibold">{t(`${state}Title`)}</h2>
      <p className="max-w-md text-sm text-(--muted)">
        {t(`${state}Description`)}
      </p>
      {state !== "checking" ? (
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => void access.refresh()}>
            {t("retry")}
          </Button>
          {locked ? (
            <>
              <Link
                href="/pricing"
                className="rounded-lg bg-(--primary) px-4 py-2 text-sm"
              >
                <span className="text-(--primary-foreground)">
                  {t("plans")}
                </span>
              </Link>
              <Link
                href="/trash"
                className="rounded-lg border border-(--border) px-4 py-2 text-sm"
              >
                {t("trash")}
              </Link>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
