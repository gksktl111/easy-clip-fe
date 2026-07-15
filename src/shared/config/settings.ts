import type { AppLocale } from "@/shared/config/locale";

export type ThemeMode = "light" | "dark";
export type LanguageCode = AppLocale;

export const DEFAULT_THEME: ThemeMode = "dark";

// 서버 렌더링에서도 읽을 수 있도록 사용자 theme는 cookie에 저장합니다.
export const THEME_COOKIE_NAME = "easy_clip_theme";
export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const isThemeMode = (value: string | undefined): value is ThemeMode =>
  value === "light" || value === "dark";
