"use client";

import { useCallback, useState } from "react";
import { HiOutlineMenuAlt4, HiOutlinePaperClip } from "react-icons/hi";
import { AppSidebar } from "@/app/(app)/_components/sidebar/AppSidebar";
import { SettingsModal } from "@/features/settings";
import { Button } from "@/shared/ui/button/Button";

interface AppShellProps {
  children: React.ReactNode;
}

// 인증된 앱 화면의 전역 탐색과 설정 진입점을 조합합니다.
export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <header className="bg-background border-b border-(--border) md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            onClick={openSidebar}
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="사이드바 열기"
          >
            <HiOutlineMenuAlt4 className="h-5 w-5" aria-hidden />
          </Button>

          <div className="flex items-center gap-2">
            <HiOutlinePaperClip className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">Easy Clip</span>
          </div>

          <div className="h-10 w-10" aria-hidden />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          onOpenSettings={openSettings}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={closeSidebar}
        />
        <main className="bg-background min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      {isSettingsOpen ? <SettingsModal onClose={closeSettings} /> : null}
    </div>
  );
}
