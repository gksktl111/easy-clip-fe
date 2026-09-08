"use client";

// 세션 확인 또는 OAuth 이동이 진행 중일 때 안내 문구를 표시합니다.
interface LoginLoadingStateProps {
  label: string;
  isVisible: boolean;
}

export function LoginLoadingState({
  label,
  isVisible,
}: LoginLoadingStateProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="mt-6 flex items-center justify-center gap-2 text-sm text-(--muted)"
      role="status"
    >
      <svg
        className="h-4 w-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
