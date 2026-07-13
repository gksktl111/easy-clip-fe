"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { HiOutlineClock, HiOutlineStar, HiOutlineTrash } from "react-icons/hi";
import { AppSidebarFooter } from "@/app/(app)/_components/sidebar/AppSidebarFooter";
import { AppSidebarHeader } from "@/app/(app)/_components/sidebar/AppSidebarHeader";
import { AppSidebarNav } from "@/app/(app)/_components/sidebar/AppSidebarNav";
import { invalidateClipQueries } from "@/features/clip";
import { FolderSidebarContent, useFoldersQuery } from "@/features/folder";
import { invalidateTrashQueries } from "@/features/trash";
import { useSession } from "@/shared/session/useSession";

const RESERVED_PATHNAMES = new Set([
  "favorites",
  "recent",
  "trash",
  "login",
  "pricing",
]);

interface AppSidebarProps {
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

// 여러 기능의 탐색, 사용자 메뉴와 폴더 섹션을 앱 사이드바로 조합합니다.
export function AppSidebar({
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, user } = useSession();
  const isAuthenticated = Boolean(user);
  const { folders, isLoading: isFoldersLoading } = useFoldersQuery();
  const pathnameFolderId = pathname.split("/").filter(Boolean)[0] ?? null;
  const currentFolderId =
    pathnameFolderId && !RESERVED_PATHNAMES.has(pathnameFolderId)
      ? pathnameFolderId
      : (folders[0]?.id ?? null);
  const topNavs = [
    {
      href: currentFolderId ? `/${currentFolderId}/favorites` : "/favorites",
      label: t("favorites"),
      icon: <HiOutlineStar className="h-5 w-5" aria-hidden />,
    },
    {
      href: currentFolderId ? `/${currentFolderId}/recent` : "/recent",
      label: t("recent"),
      icon: <HiOutlineClock className="h-5 w-5" aria-hidden />,
    },
    {
      href: "/trash",
      label: t("trash"),
      icon: <HiOutlineTrash className="h-5 w-5" aria-hidden />,
    },
  ];
  const userLabel = user?.email ?? user?.displayName ?? t("guest");

  useEffect(() => {
    onCloseMobile?.();
  }, [onCloseMobile, pathname]);

  const requireAuthentication = useCallback(() => {
    onCloseMobile?.();
    router.push("/login");
  }, [onCloseMobile, router]);

  const handleFolderDeleted = useCallback(
    (redirectPath: string | null) => {
      void Promise.all([
        invalidateClipQueries(queryClient),
        invalidateTrashQueries(queryClient),
      ]);

      if (redirectPath) {
        onCloseMobile?.();
        router.replace(redirectPath);
      }
    },
    [onCloseMobile, queryClient, router],
  );

  const handleLogout = useCallback(async () => {
    onCloseMobile?.();
    await logout();
  }, [logout, onCloseMobile]);

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 cursor-pointer bg-(--overlay) md:hidden"
          aria-label="사이드바 닫기"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 max-w-[86vw] flex-col border-r border-(--border) bg-(--surface-muted) transition-transform duration-300 md:static md:z-auto md:w-64 md:max-w-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <AppSidebarHeader onCloseMobile={onCloseMobile} />

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            <AppSidebarNav
              items={topNavs}
              pathname={pathname}
              onNavigate={onCloseMobile}
            />
            <FolderSidebarContent
              folders={folders}
              isLoading={isFoldersLoading}
              pathname={pathname}
              isAuthenticated={isAuthenticated}
              onNavigate={onCloseMobile}
              onAuthenticationRequired={requireAuthentication}
              onFolderDeleted={handleFolderDeleted}
            />
          </div>
        </nav>

        <AppSidebarFooter
          userLabel={userLabel}
          settingsLabel={t("settings")}
          logoutLabel={t("logout")}
          upgradePlanLabel={t("upgradePlan")}
          onOpenSettings={() => {
            onCloseMobile?.();
            onOpenSettings();
          }}
          onUpgradePlan={() => {
            onCloseMobile?.();
            router.push("/pricing");
          }}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
