"use client";

import Link from "next/link";

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
