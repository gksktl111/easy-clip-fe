"use client";

interface ClipCopyToastProps {
  label: string;
  position: {
    x: number;
    y: number;
  } | null;
}

export function ClipCopyToast({ label, position }: ClipCopyToastProps) {
  if (!position) {
    return null;
  }

  return (
    <div
      className="fixed z-50 rounded-full bg-(--chip-bg) px-3 py-1.5 text-xs font-semibold text-(--chip-text) shadow-md"
      style={{ left: position.x + 12, top: position.y + 12 }}
    >
      {label}
    </div>
  );
}
