"use client";

import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white text-slate-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
      {isSettingsOpen ? (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      ) : null}
    </div>
  );
}
