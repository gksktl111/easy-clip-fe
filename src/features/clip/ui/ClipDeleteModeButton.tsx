"use client";

import { useTranslations } from "next-intl";
import { HiOutlineTrash } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";

// 폴더 화면에서 클립 선택 삭제 모드로 진입하는 고정 액션을 제공합니다.
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
      <HiOutlineTrash className="h-4 w-4" aria-hidden />
      {label ?? t("deleteClips")}
    </Button>
  );
}
