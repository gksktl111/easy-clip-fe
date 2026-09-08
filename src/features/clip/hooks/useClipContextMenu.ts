"use client";

import { useEffect } from "react";
import type { Clip } from "@/features/clip/model/clip";
import {
  type ContextMenuState,
  useContextMenu,
} from "@/shared/hooks/useContextMenu";

export type ClipContextMenuState = ContextMenuState<string>;

interface UseClipContextMenuOptions {
  isDisabled?: boolean;
}

// 클립 컨텍스트 메뉴의 위치와 열림 상태, 바깥 영역 닫기 동작을 관리합니다.
export const useClipContextMenu = ({
  isDisabled = false,
}: UseClipContextMenuOptions = {}) => {
  const contextMenu = useContextMenu<string>({
    dataAttribute: "data-clip-menu",
    isDisabled,
  });

  const { menu, closeMenu } = contextMenu;
  useEffect(() => {
    if (!menu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menu, closeMenu]);

  const openClipContextMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    clip: Clip,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.type === "contextmenu" ? event.clientX : rect.right;
    const y = event.type === "contextmenu" ? event.clientY : rect.bottom;
    contextMenu.toggleMenu(clip.id, {
      x: Math.max(8, Math.min(x, window.innerWidth - 144)),
      y: Math.max(8, Math.min(y, window.innerHeight - 128)),
    });
  };

  return {
    closeContextMenu: contextMenu.closeMenu,
    contextMenu: contextMenu.menu,
    openContextMenu: openClipContextMenu,
  };
};
