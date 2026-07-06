import { APP_LOCALES, type AppLocale } from "@/shared/config/locale";

export const SERVER_SUPPORTED_LANGUAGES = APP_LOCALES;

export type ServerSupportedLanguage = AppLocale;

export type UserSettingsThemeDto = "LIGHT" | "DARK" | "SYSTEM";

export interface UserSettingsResponseDto {
  id: string;
  userId: string;
  theme: UserSettingsThemeDto;
  language: ServerSupportedLanguage;
}

export interface UpdateUserSettingsDto {
  theme?: UserSettingsThemeDto;
  language?: ServerSupportedLanguage;
}
