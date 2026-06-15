"use client";

interface SocialLoginButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isLoading: boolean;
}

export function SocialLoginButton({
  label,
  icon,
  onClick,
  isLoading,
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
