"use client";

import { useEffect, useState } from "react";
import { SettingsModal } from "./SettingsModal";
import { Sidebar } from "./Sidebar";
import { applySettings, useSettingsStore } from "../../store/settingsStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, language } = useSettingsStore();

  useEffect(() => {
    applySettings(theme, language);
  }, [language, theme]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="flex-1 overflow-hidden bg-[var(--background)]">
          {children}
        </main>
      </div>
      {isSettingsOpen ? (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      ) : null}
    </div>
  );
}
