"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button/Button";
import { IMAGE_CLIP_ACCEPT } from "@/features/clip/service/imageClipValidation";

interface FolderClipCaptureHintProps {
  message: string;
  onTextSubmit: (text: string) => Promise<boolean>;
  onImageSelect: (file: File) => Promise<boolean>;
  pending: boolean;
  hasDraft: boolean;
}

export function FolderClipCaptureHint({
  message,
  onTextSubmit,
  onImageSelect,
  pending,
  hasDraft,
}: FolderClipCaptureHintProps) {
  const t = useTranslations("clips");
  const [text, setText] = useState("");

  return (
    <div
      className="px-4 pt-4 md:px-6"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-4 text-center text-xs text-(--muted)">
        <p>{message}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-center">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:max-w-md">
            <span className="sr-only">{t("captureTextLabel")}</span>
            <textarea
              value={text}
              disabled={pending || hasDraft}
              onChange={(event) => setText(event.target.value)}
              placeholder={t("captureTextPlaceholder")}
              rows={2}
              className="min-h-11 w-full resize-y rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
            />
          </label>
          <Button
            size="sm"
            disabled={!text.trim() || pending || hasDraft}
            onClick={async () => {
              const submittedText = text;
              if ((await onTextSubmit(submittedText)) && text === submittedText)
                setText("");
            }}
          >
            {t("captureTextAction")}
          </Button>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-(--border) px-3 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--surface-muted)">
            {t("captureImageAction")}
            <input
              type="file"
              accept={IMAGE_CLIP_ACCEPT}
              className="sr-only"
              disabled={pending || hasDraft}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImageSelect(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
