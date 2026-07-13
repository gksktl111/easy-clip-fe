"use client";

import Link from "next/link";

interface AppSidebarNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface AppSidebarNavProps {
  items: AppSidebarNavItem[];
  pathname: string;
  onNavigate?: () => void;
}

export function AppSidebarNav({
  items,
  pathname,
  onNavigate,
}: AppSidebarNavProps) {
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
