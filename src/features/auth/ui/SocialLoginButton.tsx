"use client";

import { Button } from "@/shared/ui/button/Button";

// OAuth 제공자 아이콘과 라벨을 공통 버튼 스타일로 렌더링합니다.
interface SocialLoginButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}

export function SocialLoginButton({
  label,
  icon,
  onClick,
  disabled,
}: SocialLoginButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="secondarySurface"
      size="lg"
      fullWidth
      className="rounded-lg disabled:cursor-not-allowed"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
