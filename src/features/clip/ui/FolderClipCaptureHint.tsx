"use client";

import { useTranslations } from "next-intl";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";

interface FolderClipCaptureHintProps {
  message: string;
  onPaste: () => Promise<boolean>;
  pending: boolean;
  disabled: boolean;
}

export function FolderClipCaptureHint({
  message,
  onPaste,
  pending,
  disabled,
}: FolderClipCaptureHintProps) {
  const t = useTranslations("clips");
  return (
    <div
      className="px-4 pt-3 md:px-6"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--surface) px-3 py-3">
        <p className="min-w-0 text-xs leading-relaxed text-(--muted)">
          {message}
        </p>
        <Button
          size="sm"
          className="min-h-11 shrink-0 gap-2"
          disabled={disabled || pending}
          aria-busy={pending}
          onClick={() => void onPaste()}
        >
          <HiOutlineClipboardCopy className="h-4 w-4" aria-hidden />
          {pending ? t("pastePending") : t("pasteAction")}
        </Button>
      </div>
    </div>
  );
}
