"use client";

import { Button } from "@/shared/ui/button/Button";

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
    <Button
      onClick={onClick}
      disabled={isLoading}
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
