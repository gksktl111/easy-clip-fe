"use client";

interface FolderClipCaptureHintProps {
  message: string;
}

export function FolderClipCaptureHint({
  message,
}: FolderClipCaptureHintProps) {
  return (
    <div className="px-4 pt-4 md:px-6">
      <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-center text-xs text-(--muted)">
        {message}
      </div>
    </div>
  );
}
