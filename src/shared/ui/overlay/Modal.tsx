"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// 공통 모달의 오버레이, 컨테이너, 바깥 영역 닫기 동작을 제공합니다.
interface ModalProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isOpen?: boolean;
  overlay?: "default" | "strong";
  onClose?: () => void;
}

export function Modal({
  children,
  className = "",
  contentClassName = "",
  isOpen = true,
  overlay = "default",
  onClose,
}: ModalProps) {
  const portalElement = typeof document === "undefined" ? null : document.body;

  if (!isOpen || !portalElement) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
        overlay === "strong" ? "bg-(--overlay-strong)" : "bg-(--overlay)"
      } ${className}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className={contentClassName}>{children}</div>
    </div>,
    portalElement,
  );
}
