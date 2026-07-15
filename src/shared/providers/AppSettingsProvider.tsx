"use client";

// 초기 사용자 설정을 반영해 다국어 메시지와 테마 상태를 제공합니다.
import { useEffect, useLayoutEffect, useRef } from "react";
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
  const initialSettingsRef = useRef<{
    language: AppLocale;
    theme: ThemeMode;
  } | null>(null);

  // 자식이 첫 렌더에서 DEFAULT 설정을 읽지 않도록 SSR 초기값을 한 번만 먼저 주입합니다.
  if (initialSettingsRef.current === null) {
    initialSettingsRef.current = {
      language: initialLocale,
      theme: initialTheme,
    };
    useSettingsStore.getState().applyInitialSettings(initialSettingsRef.current);
  }

  const storeTheme = useSettingsStore((state) => state.theme);
  const storeLanguage = useSettingsStore((state) => state.language);

  useIsomorphicLayoutEffect(() => {
    // 서버가 결정한 초기 설정을 settings cookie에도 반영합니다.
    useSettingsStore.getState().hydrateFromServer({
      language: initialLocale,
      theme: initialTheme,
    });
  }, [initialLocale, initialTheme]);

  useEffect(() => {
    applySettings(storeTheme, storeLanguage);
  }, [storeLanguage, storeTheme]);

  return (
    <NextIntlClientProvider
      locale={storeLanguage}
      messages={messagesByLocale[storeLanguage]}
      timeZone={DEFAULT_TIME_ZONE}
    >
      {children}
    </NextIntlClientProvider>
  );
}
