export const APP_LOCALES = ["ko", "en", "ja", "zh"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "ko";
export const DEFAULT_TIME_ZONE = "Asia/Seoul";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export const isAppLocale = (value: string): value is AppLocale =>
  APP_LOCALES.includes(value as AppLocale);
