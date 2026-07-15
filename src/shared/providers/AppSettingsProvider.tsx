"use client";

// 초기 사용자 설정을 반영해 다국어 메시지와 테마 상태를 제공합니다.
import { useEffect, useLayoutEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import koMessages from "@/messages/ko.json";
import zhMessages from "@/messages/zh.json";
import { DEFAULT_TIME_ZONE, type AppLocale } from "@/shared/config/locale";
import {
  applySettings,
  type ThemeMode,
  useSettingsStore,
} from "@/shared/store/settingsStore";

interface AppSettingsProviderProps {
  children: React.ReactNode;
  initialLocale: AppLocale;
  initialTheme: ThemeMode;
}

const messagesByLocale = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
} as const;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function AppSettingsProvider({
  children,
  initialLocale,
  initialTheme,
}: AppSettingsProviderProps) {
  const [isSettingsReady, setIsSettingsReady] = useState(false);
  const storeTheme = useSettingsStore((state) => state.theme);
  const storeLanguage = useSettingsStore((state) => state.language);
  const theme = isSettingsReady ? storeTheme : initialTheme;
  const language = isSettingsReady ? storeLanguage : initialLocale;

  useIsomorphicLayoutEffect(() => {
    // 서버가 결정한 초기 설정을 현재 런타임 store와 settings cookie에 반영합니다.
    useSettingsStore.getState().hydrateFromServer({
      language: initialLocale,
      theme: initialTheme,
    });
    setIsSettingsReady(true);
  }, [initialLocale, initialTheme]);

  useEffect(() => {
    applySettings(theme, language);
  }, [language, theme]);

  return (
    <NextIntlClientProvider
      locale={language ?? initialLocale}
      messages={messagesByLocale[language]}
      timeZone={DEFAULT_TIME_ZONE}
    >
      {children}
    </NextIntlClientProvider>
  );
}
