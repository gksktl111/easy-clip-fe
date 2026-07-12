"use client";

import { useCallback, useEffect, useState } from "react";
import type { Clip } from "@/features/clip/model/clip";

export interface ClipContextMenuState {
  id: string;
  x: number;
  y: number;
}

interface UseClipContextMenuOptions {
  isDisabled?: boolean;
}

// 클립 컨텍스트 메뉴의 위치와 열림 상태, 바깥 영역 닫기 동작을 관리합니다.
export const useClipContextMenu = ({
  isDisabled = false,
}: UseClipContextMenuOptions = {}) => {
  const [contextMenu, setContextMenu] = useState<ClipContextMenuState | null>(
    null,
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const openContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, clip: Clip) => {
      event.preventDefault();

      if (isDisabled) {
        return;
      }

      setContextMenu({
        id: clip.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [isDisabled],
  );

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-clip-menu]")) {
        return;
      }

      closeContextMenu();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [closeContextMenu, contextMenu]);

  return {
    closeContextMenu,
    contextMenu,
    openContextMenu,
  };
};
