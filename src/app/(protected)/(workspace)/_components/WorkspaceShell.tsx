"use client";

import { useState } from "react";
import { HiOutlineMenuAlt4, HiOutlinePaperClip } from "react-icons/hi";
import { WorkspaceSidebar } from "@/app/(protected)/(workspace)/_components/sidebar/WorkspaceSidebar";
import { SettingsModal } from "@/features/settings";
import { Button } from "@/shared/ui/button/Button";

// 워크스페이스 화면의 전역 탐색과 설정 진입점을 조합합니다.
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = () => setIsSidebarOpen(true);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      {/* 모바일 헤더 */}
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

          <div className="h-10 w-10" />
        </div>
      </header>

      {/* 사이드바 */}
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar
          onOpenSettings={openSettings}
          isMobileOpen={isSidebarOpen}
          onMobileOpenChange={setIsSidebarOpen}
        />
        <main className="bg-background min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* setting 모달 */}
      {isSettingsOpen ? <SettingsModal onClose={closeSettings} /> : null}
    </div>
  );
}
