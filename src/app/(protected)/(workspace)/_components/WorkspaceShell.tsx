"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { WorkspaceSidebar } from "@/app/(protected)/(workspace)/_components/sidebar/WorkspaceSidebar";
import { MobileHeaderContext } from "@/shared/layout/MobileHeaderPortal";
import { SettingsModal } from "@/features/settings";
import { Button } from "@/shared/ui/button/Button";

// 워크스페이스 화면의 전역 탐색과 설정 진입점을 조합합니다.
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [mobileHeader, setMobileHeader] = useState<HTMLDivElement | null>(null);
  const t = useTranslations("sidebar");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = () => setIsSidebarOpen(true);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <MobileHeaderContext.Provider value={mobileHeader}>
      <div className="bg-background text-foreground flex h-dvh min-h-0 flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <header className="bg-background border-b border-(--border) md:hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-1">
            <Button
              onClick={openSidebar}
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full"
              aria-label={t("open")}
            >
              <HiOutlineMenuAlt4 className="h-5 w-5" aria-hidden />
            </Button>

            <div
              ref={setMobileHeader}
              data-mobile-header
              className="min-w-0 flex-1 empty:hidden"
            />
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
    </MobileHeaderContext.Provider>
  );
}
