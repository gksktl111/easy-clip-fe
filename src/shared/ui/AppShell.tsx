"use client";

import { useState } from "react";
import { Sidebar } from "@/features/folder/ui/Sidebar";
import { SettingsModal } from "@/shared/ui/SettingsModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="bg-background flex-1 overflow-hidden">{children}</main>
      </div>
      {isSettingsOpen ? (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      ) : null}
    </div>
  );
}
