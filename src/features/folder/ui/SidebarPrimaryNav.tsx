"use client";

import Link from "next/link";

// 즐겨찾기, 최근 항목, 휴지통으로 이동하는 주요 탐색 링크를 표시합니다.
interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarPrimaryNavProps {
  items: SidebarNavItem[];
  pathname: string;
  onNavigate?: () => void;
}

export function SidebarPrimaryNav({
  items,
  pathname,
  onNavigate,
}: SidebarPrimaryNavProps) {
  return (
    <ul className="space-y-2 px-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "text-foreground bg-(--surface)"
                : "text-muted hover:text-foreground hover:bg-(--surface)"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
