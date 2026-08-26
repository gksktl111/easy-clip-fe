"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import { HiOutlineClock, HiOutlineStar, HiOutlineTrash } from "react-icons/hi";
import { WorkspaceSidebarFooter } from "@/app/(protected)/(workspace)/_components/sidebar/WorkspaceSidebarFooter";
import { WorkspaceSidebarHeader } from "@/app/(protected)/(workspace)/_components/sidebar/WorkspaceSidebarHeader";
import { WorkspaceSidebarNav } from "@/app/(protected)/(workspace)/_components/sidebar/WorkspaceSidebarNav";
import { clipQueryKeys } from "@/features/clip";
import { FolderSidebarContent, useFoldersQuery } from "@/features/folder";
import { invalidateTrashQueries } from "@/features/trash";

interface WorkspaceSidebarProps {
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (isOpen: boolean) => void;
}

// 여러 기능의 탐색, 사용자 메뉴와 폴더 섹션을 워크스페이스 사이드바로 조합합니다.
export function WorkspaceSidebar({
  onOpenSettings,
  isMobileOpen = false,
  onMobileOpenChange,
}: WorkspaceSidebarProps) {
  const t = useTranslations("sidebar");
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { folders, isLoading: isFoldersLoading } = useFoldersQuery();

  const topNavs = [
    {
      href: "/favorites",
      label: t("favorites"),
      icon: <HiOutlineStar className="h-5 w-5" aria-hidden />,
    },
    {
      href: "/recent",
      label: t("recent"),
      icon: <HiOutlineClock className="h-5 w-5" aria-hidden />,
    },
    {
      href: "/trash",
      label: t("trash"),
      icon: <HiOutlineTrash className="h-5 w-5" aria-hidden />,
    },
  ];

  const closeMobile = () => onMobileOpenChange?.(false);

  const handleFolderDeleted = (redirectPath: string | null) => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: clipQueryKeys.all }),
      invalidateTrashQueries(queryClient),
    ]);

    if (redirectPath) {
      closeMobile();
      router.replace(redirectPath);
    }
  };

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          onClick={closeMobile}
          className="fixed inset-0 z-30 cursor-pointer bg-(--overlay) md:hidden"
          aria-label={t("closeSidebar")}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 max-w-[86vw] flex-col border-r border-(--border) bg-(--surface-muted) transition-transform duration-300 md:static md:z-auto md:w-64 md:max-w-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <WorkspaceSidebarHeader onCloseMobile={closeMobile} />

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            <WorkspaceSidebarNav
              items={topNavs}
              pathname={pathname}
              onNavigate={closeMobile}
            />
            <FolderSidebarContent
              folders={folders}
              isLoading={isFoldersLoading}
              pathname={pathname}
              activeFolderId={params.id ?? null}
              onNavigate={closeMobile}
              onFolderDeleted={handleFolderDeleted}
            />
          </div>
        </nav>

        <WorkspaceSidebarFooter
          onCloseMobile={closeMobile}
          onOpenSettings={() => {
            closeMobile();
            onOpenSettings();
          }}
          onUpgradePlan={() => {
            closeMobile();
            router.push("/pricing");
          }}
        />
      </aside>
    </>
  );
}
