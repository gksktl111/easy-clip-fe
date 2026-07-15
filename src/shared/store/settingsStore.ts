"use client";

import { create } from "zustand";
import { DEFAULT_LOCALE } from "@/shared/config/locale";
import {
  DEFAULT_THEME,
  LANGUAGE_COOKIE_NAME,
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
  applyInitialSettings: (settings: {
    theme: ThemeMode;
    language: LanguageCode;
  }) => void;
  hydrateFromServer: (settings: {
    theme?: ThemeMode;
    language?: LanguageCode;
  }) => void;
}

const writeSettingsCookie = (
  name: typeof THEME_COOKIE_NAME | typeof LANGUAGE_COOKIE_NAME,
  value: ThemeMode | LanguageCode,
) => {
  document.cookie = [
    `${name}=${value}`,
    `Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  theme: DEFAULT_THEME,
  language: DEFAULT_LOCALE,
  setTheme: (theme) => {
    writeSettingsCookie(THEME_COOKIE_NAME, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    writeSettingsCookie(THEME_COOKIE_NAME, theme);
    set({ theme });
  },
  setLanguage: (language) => {
    writeSettingsCookie(LANGUAGE_COOKIE_NAME, language);
    set({ language });
  },
  syncLanguage: (language) => {
    writeSettingsCookie(LANGUAGE_COOKIE_NAME, language);
    set({ language });
  },
  applyInitialSettings: ({ theme, language }) => set({ theme, language }),
  hydrateFromServer: ({ theme, language }) => {
    if (theme) {
      writeSettingsCookie(THEME_COOKIE_NAME, theme);
    }

    if (language) {
      writeSettingsCookie(LANGUAGE_COOKIE_NAME, language);
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
