"use client";

import { create } from "zustand";
import { DEFAULT_LOCALE } from "@/shared/config/locale";
import {
  DEFAULT_THEME,
  THEME_COOKIE_MAX_AGE_SECONDS,
  THEME_COOKIE_NAME,
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

const writeThemeCookie = (theme: ThemeMode) => {
  document.cookie = [
    `${THEME_COOKIE_NAME}=${theme}`,
    `Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  theme: DEFAULT_THEME,
  language: DEFAULT_LOCALE,
  setTheme: (theme) => {
    writeThemeCookie(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    writeThemeCookie(theme);
    set({ theme });
  },
  setLanguage: (language) => set({ language }),
  syncLanguage: (language) => set({ language }),
  hydrateFromServer: ({ theme, language }) => {
    if (theme) {
      writeThemeCookie(theme);
    }

    set((state) => ({
      theme: theme ?? state.theme,
      language: language ?? state.language,
    }));
  },
}));

export const applySettings = (theme: ThemeMode, language: LanguageCode) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language;
};
