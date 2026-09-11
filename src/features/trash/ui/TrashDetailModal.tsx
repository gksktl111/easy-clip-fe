"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TrashItemRow } from "@/features/trash/model/trashRow";
import { formatDeletedAt } from "@/features/trash/ui/trashRow";
import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

interface TrashDetailModalProps {
  row: TrashItemRow;
  pending: boolean;
  onClose: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

export function TrashDetailModal({
  row,
  pending,
  onClose,
  onRestore,
  onDelete,
}: TrashDetailModalProps) {
  const t = useTranslations("trash");
  const [imageFailed, setImageFailed] = useState(false);
  const content = row.kind === "clip" ? row.content : null;
  return (
    <Modal
      ariaLabel={t("details")}
      onClose={onClose}
      contentClassName="w-full max-w-[668px]"
      className="p-3 md:p-6"
    >
      <section className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-(--border) bg-(--surface-elevated)">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-(--border) px-4 py-2">
          <h2 className="text-sm font-semibold">{t("details")}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11"
            onClick={onClose}
          >
            {t("closeDetails")}
          </Button>
        </header>
        <div className="min-h-0 overflow-y-auto p-4 md:p-6">
          <h3 className="text-lg font-semibold wrap-anywhere">{row.name}</h3>
          <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
            <dt className="text-(--muted)">{t("type")}</dt>
            <dd>{row.typeLabel}</dd>
            {row.kind === "clip" ? (
              <>
                <dt className="text-(--muted)">{t("parentFolder")}</dt>
                <dd className="wrap-anywhere">{row.parentFolderName}</dd>
              </>
            ) : null}
            <dt className="text-(--muted)">{t("deletedAt")}</dt>
            <dd>{formatDeletedAt(row.deletedAt)}</dd>
          </dl>
          <div className="mt-5 border-t border-(--border) pt-5">
            {row.kind === "folder" ? (
              <p className="text-sm leading-6 text-(--muted)">
                {t("folderDetails")}
              </p>
            ) : content == null ? (
              <p className="text-sm leading-6 text-(--muted)">
                {t("contentUnavailable")}
              </p>
            ) : row.clipType === "IMAGE" ? (
              imageFailed || !/^(https?:\/\/|\/(?!\/))/i.test(content) ? (
                <p role="status" className="text-sm text-(--muted)">
                  {t("imageUnavailable")}
                </p>
              ) : (
                <div className="relative h-[50dvh] min-h-48">
                  <Image
                    src={content}
                    alt={row.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 620px"
                    className="object-contain"
                    onError={() => setImageFailed(true)}
                  />
                </div>
              )
            ) : (
              <>
                {row.clipType === "COLOR" &&
                /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(
                  content,
                ) ? (
                  <div
                    className="mb-4 h-32 rounded-lg border border-(--border)"
                    style={{ backgroundColor: content }}
                    aria-hidden
                  />
                ) : null}
                <pre className="font-sans text-sm leading-7 wrap-anywhere whitespace-pre-wrap">
                  {content}
                </pre>
              </>
            )}
          </div>
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-(--border) p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="primary"
            size="sm"
            className="min-h-11"
            disabled={pending}
            onClick={onRestore}
          >
            {t("restore")}
          </Button>
          <Button
            variant="dangerOutline"
            size="sm"
            className="min-h-11"
            disabled={pending}
            onClick={onDelete}
          >
            {t("deleteForever")}
          </Button>
        </footer>
      </section>
    </Modal>
  );
}
