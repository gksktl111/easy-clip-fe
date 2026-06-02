"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/domains/folders/ui/Sidebar";
import { SettingsModal } from "@/domains/settings/ui/SettingsModal";
import { applySettings, useSettingsStore } from "@/store/settingsStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { language, theme } = useSettingsStore();

  useEffect(() => {
    applySettings(theme, language);
  }, [language, theme]);

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
