"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { DEFAULT_LOCALE, type AppLocale } from "@/shared/config/locale";

export type ThemeMode = "light" | "dark";
export type LanguageCode = AppLocale;

interface SettingsState {
  theme: ThemeMode;
  language: LanguageCode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: LanguageCode) => void;
  syncLanguage: (language: LanguageCode) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      language: DEFAULT_LOCALE,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setLanguage: (language) => set({ language }),
      syncLanguage: (language) => set({ language }),
    }),
    {
      name: "easy-clip-settings",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage,
      ),
    },
  ),
);

export const applySettings = (theme: ThemeMode, language: LanguageCode) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language;
};
