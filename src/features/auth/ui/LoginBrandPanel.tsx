"use client";

import { HiOutlineClipboardCopy } from "react-icons/hi";

interface LoginBrandPanelProps {
  title: string;
  subtitle: string;
}

export function LoginBrandPanel({
  title,
  subtitle,
}: LoginBrandPanelProps) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--primary)">
        <HiOutlineClipboardCopy className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-semibold text-(--foreground)">{title}</h1>
      <p className="mt-2 text-center text-sm text-(--muted)">{subtitle}</p>
    </div>
  );
}
