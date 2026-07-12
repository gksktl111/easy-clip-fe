"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button/Button";

interface ClipDeleteModeButtonProps {
  disabled?: boolean;
  label?: string;
  onClick: () => void;
}

export function ClipDeleteModeButton({
  disabled = false,
  label,
  onClick,
}: ClipDeleteModeButtonProps) {
  const t = useTranslations("clips.actions");
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant="danger"
      size="sm"
      className="absolute right-4 bottom-4 rounded-full font-semibold shadow-lg disabled:cursor-not-allowed md:right-6 md:bottom-6"
    >
      {label ?? t("deleteClips")}
    </Button>
  );
}
