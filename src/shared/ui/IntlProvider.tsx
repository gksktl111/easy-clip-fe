"use client";

import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import koMessages from "@/messages/ko.json";
import zhMessages from "@/messages/zh.json";
import { DEFAULT_TIME_ZONE, type AppLocale } from "@/shared/config/locale";
import { applySettings, useSettingsStore } from "@/shared/store/settingsStore";

interface IntlProviderProps {
  children: React.ReactNode;
  initialLocale: AppLocale;
}

const messagesByLocale = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
} as const;

export function IntlProvider({ children, initialLocale }: IntlProviderProps) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);

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
