"use client";

import { useCallback, useEffect, useState } from "react";

export interface ContextMenuState<TId extends string = string> {
  id: TId;
  // null 좌표는 트리 안의 기본 위치에 띄우는 메뉴, 숫자 좌표는 커서 위치에 띄우는 메뉴를 뜻합니다.
  x: number | null;
  y: number | null;
}

interface UseContextMenuOptions {
  dataAttribute: string;
  isDisabled?: boolean;
}

export const useContextMenu = <TId extends string = string>({
  dataAttribute,
  isDisabled = false,
}: UseContextMenuOptions) => {
  const [menu, setMenu] = useState<ContextMenuState<TId> | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  const openMenu = useCallback(
    (id: TId, position?: { x: number; y: number }) => {
      if (isDisabled) {
        return;
      }

      setMenu({ id, x: position?.x ?? null, y: position?.y ?? null });
    },
    [isDisabled],
  );

  const openContextMenu = useCallback(
    (event: React.MouseEvent, id: TId) => {
      event.preventDefault();

      if (isDisabled) {
        return;
      }

      setMenu({ id, x: event.clientX, y: event.clientY });
    },
    [isDisabled],
  );

  const toggleMenu = useCallback(
    (id: TId, position?: { x: number; y: number }) => {
      if (isDisabled) {
        return;
      }

      setMenu((current) =>
        current?.id === id
          ? null
          : { id, x: position?.x ?? null, y: position?.y ?? null },
      );
    },
    [isDisabled],
  );

  useEffect(() => {
    if (!menu) {
      return;
    }

    // 메뉴 트리와 트리거에 같은 data attribute를 붙여 fixed 메뉴도 내부 클릭으로 취급합니다.
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest(`[${dataAttribute}]`)) {
        return;
      }

      closeMenu();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [closeMenu, dataAttribute, menu]);

  return {
    closeMenu,
    menu,
    openContextMenu,
    openMenu,
    toggleMenu,
  };
};
