"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Clip } from "@/features/clip/model/clip";
import { TagChip } from "@/features/clip/ui/TagChip";
import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

interface ClipPreviewModalProps {
  clip: Clip;
  onClose: () => void;
  onCopy?: (clip: Clip, event: React.MouseEvent<HTMLButtonElement>) => void;
  isCopying: boolean;
  isCopyBlocked: boolean;
}

export function ClipPreviewModal({
  clip,
  onClose,
  onCopy,
  isCopying,
  isCopyBlocked,
}: ClipPreviewModalProps) {
  const t = useTranslations("clips.item");
  return (
    <Modal
      ariaLabel={clip.name}
      onClose={onClose}
      contentClassName="w-full max-w-2xl"
      className="py-4"
    >
      <section className="flex max-h-[90dvh] flex-col overflow-hidden rounded-xl border border-(--border) bg-(--surface-elevated) shadow-lg">
        <header className="flex items-start justify-between gap-4 border-b border-(--border) px-5 py-4">
          <p className="text-sm font-semibold">{t("previewTitle")}</p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("closePreview")}
          </Button>
        </header>
        <div className="min-h-0 overflow-y-auto p-5">
          <h2 className="mb-4 text-lg font-semibold wrap-anywhere">
            {clip.name}
          </h2>
          {clip.type === "image" ? (
            <div className="relative h-[55vh] w-full">
              <Image
                src={clip.content}
                alt={clip.name}
                fill
                sizes="(max-width: 768px) 90vw, 640px"
                className="object-contain"
              />
            </div>
          ) : (
            <>
              {clip.type === "color" ? (
                <div
                  className="mb-4 h-24 rounded-lg border border-(--border)"
                  style={{ backgroundColor: clip.content }}
                  aria-hidden
                />
              ) : null}
              <pre className="font-sans text-sm leading-7 wrap-anywhere whitespace-pre-wrap">
                {clip.content}
              </pre>
            </>
          )}
          {clip.tags.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {clip.tags.map((tag) => (
                <li key={tag.id}>
                  <TagChip
                    name={tag.name}
                    backgroundColor={tag.backgroundColor}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <footer className="flex justify-end border-t border-(--border) px-5 py-4">
          <Button
            variant="primary"
            onClick={(event) => onCopy?.(clip, event)}
            disabled={!onCopy || isCopyBlocked}
            aria-busy={isCopying}
            aria-label={t("copy", { name: clip.name })}
          >
            {isCopying ? t("copying") : t("copyAction")}
          </Button>
        </footer>
      </section>
    </Modal>
  );
}
