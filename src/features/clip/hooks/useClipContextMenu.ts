"use client";

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

  const openClipContextMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    clip: Clip,
  ) => {
    contextMenu.openContextMenu(event, clip.id);
  };

  return {
    closeContextMenu: contextMenu.closeMenu,
    contextMenu: contextMenu.menu,
    openContextMenu: openClipContextMenu,
  };
};
