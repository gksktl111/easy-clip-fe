"use client";

import { useCallback, useState } from "react";
import { AuthBootstrap } from "@/features/auth/ui/AuthBootstrap";
import { HiOutlineMenuAlt4, HiOutlinePaperClip } from "react-icons/hi";
import { Sidebar } from "@/features/folder/ui/Sidebar";
import { SettingsModal } from "@/shared/ui/SettingsModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <AuthBootstrap />
      <header className="bg-background border-b border-(--border) md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={openSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-full text-(--muted) transition hover:bg-(--surface-muted) hover:text-(--foreground)"
            aria-label="사이드바 열기"
          >
            <HiOutlineMenuAlt4 className="h-5 w-5" aria-hidden />
          </button>

          <div className="flex items-center gap-2">
            <HiOutlinePaperClip className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">Easy Clip</span>
          </div>

          <div className="h-10 w-10" aria-hidden />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onOpenSettings={openSettings}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={closeSidebar}
        />
        <main className="bg-background min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      {isSettingsOpen ? (
        <SettingsModal onClose={closeSettings} />
      ) : null}
    </div>
  );
}
