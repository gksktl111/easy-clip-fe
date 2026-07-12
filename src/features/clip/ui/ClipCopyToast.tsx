"use client";

// 복사가 발생한 포인터 위치 근처에 짧은 성공 알림을 표시합니다.
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
      className="pointer-events-none fixed z-50 rounded-full bg-(--chip-bg) px-3 py-1.5 text-xs font-semibold text-(--chip-text) shadow-md"
      style={{ left: position.x + 12, top: position.y + 12 }}
      role="status"
    >
      {label}
    </div>
  );
}
