"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineClock,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineStar,
} from "react-icons/hi";

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const pathname = usePathname();
  const isFavoritesActive = pathname === "/favorites" || pathname === "/";
  const isRecentActive = pathname === "/recent";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <h1 className="text-xl font-semibold text-gray-900">Clipboard Studio</h1>
        <p className="mt-1 text-xs text-gray-500">클립을 모아두는 개인 라이브러리</p>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/favorites"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isFavoritesActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <HiOutlineStar className="h-5 w-5" aria-hidden />
              Favorites
            </Link>
          </li>
          <li>
            <Link
              href="/recent"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isRecentActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <HiOutlineClock className="h-5 w-5" aria-hidden />
              Recent
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <HiOutlinePlus className="h-5 w-5" aria-hidden />
              Add Folder
            </button>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gray-200 px-4 py-4">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <HiOutlineCog className="h-5 w-5" aria-hidden />
          Settings
        </button>
      </div>
    </aside>
  );
}
