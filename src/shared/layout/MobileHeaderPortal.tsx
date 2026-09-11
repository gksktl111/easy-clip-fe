"use client";
import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";
export const MobileHeaderContext = createContext<HTMLDivElement | null>(null);
export function MobileHeaderPortal({ children }: { children: ReactNode }) {
  const container = useContext(MobileHeaderContext);
  return container ? createPortal(children, container) : null;
}
