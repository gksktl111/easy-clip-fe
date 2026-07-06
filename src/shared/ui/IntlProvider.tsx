"use client";

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

interface IntlProviderProps {
  children: React.ReactNode;
  initialLocale: AppLocale;
  initialTheme: ThemeMode;
  preferServerSettings: boolean;
}

const messagesByLocale = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
} as const;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function IntlProvider({
  children,
  initialLocale,
  initialTheme,
  preferServerSettings,
}: IntlProviderProps) {
  const [isSettingsReady, setIsSettingsReady] = useState(false);
  const storeTheme = useSettingsStore((state) => state.theme);
  const storeLanguage = useSettingsStore((state) => state.language);
  const theme = isSettingsReady ? storeTheme : initialTheme;
  const language = isSettingsReady ? storeLanguage : initialLocale;

  useIsomorphicLayoutEffect(() => {
    let isMounted = true;

    useSettingsStore.setState({
      language: initialLocale,
      theme: initialTheme,
    });

    if (preferServerSettings) {
      setIsSettingsReady(true);
      return () => {
        isMounted = false;
      };
    }

    void Promise.resolve(useSettingsStore.persist.rehydrate()).finally(() => {
      if (isMounted) {
        setIsSettingsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialLocale, initialTheme, preferServerSettings]);

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
