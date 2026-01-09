"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type LanguageCode = "en" | "ko";

interface SettingsState {
  theme: ThemeMode;
  language: LanguageCode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: LanguageCode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      language: "en",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "easy-clip-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const applySettings = (theme: ThemeMode, language: LanguageCode) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language;
};
