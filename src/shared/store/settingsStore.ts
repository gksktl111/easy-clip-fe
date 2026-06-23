"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { DEFAULT_LOCALE } from "@/shared/config/locale";
import {
  DEFAULT_THEME,
  type LanguageCode,
  type ThemeMode,
} from "@/shared/config/settings";

export { DEFAULT_THEME };
export type { LanguageCode, ThemeMode };

interface SettingsState {
  theme: ThemeMode;
  language: LanguageCode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: LanguageCode) => void;
  syncLanguage: (language: LanguageCode) => void;
  hydrateFromServer: (settings: {
    theme?: ThemeMode;
    language?: LanguageCode;
  }) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      language: DEFAULT_LOCALE,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setLanguage: (language) => set({ language }),
      syncLanguage: (language) => set({ language }),
      hydrateFromServer: ({ theme, language }) =>
        set((state) => ({
          theme: theme ?? state.theme,
          language: language ?? state.language,
        })),
    }),
    {
      name: "easy-clip-settings",
      skipHydration: true,
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
