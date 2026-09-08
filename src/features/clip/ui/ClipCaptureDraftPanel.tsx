"use client";

import { useTranslations } from "next-intl";
import type { CaptureDraft } from "@/features/clip/store/captureDraftStore";
import { isPolicyError } from "@/shared/access/policyError";
import { PolicyErrorNotice } from "@/shared/access/PolicyErrorNotice";
import { Button } from "@/shared/ui/button/Button";

export function ClipCaptureDraftPanel({
  draft,
  pending,
  onRetry,
  onDiscard,
}: {
  draft?: CaptureDraft;
  pending: boolean;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const t = useTranslations("access");
  if (!draft || !draft.error) return null;
  return (
    <section
      className="m-4 space-y-3 rounded-xl border border-(--border) bg-(--surface) p-4"
      aria-label={t("draftTitle")}
    >
      <h2 className="text-sm font-semibold">{t("draftTitle")}</h2>
      <p className="text-xs text-(--muted)">{t("draftDescription")}</p>
      <p className="max-h-24 overflow-auto text-sm break-words whitespace-pre-wrap">
        {draft.input.type === "text" ? draft.input.text : draft.input.file.name}
      </p>
      {isPolicyError(draft.error) ? (
        <PolicyErrorNotice error={draft.error} />
      ) : null}
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={onRetry}>
          {t("retrySave")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={onDiscard}
        >
          {t("discardDraft")}
        </Button>
      </div>
    </section>
  );
}
