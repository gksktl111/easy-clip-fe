import { APP_LOCALES, type AppLocale } from "@/shared/config/locale";

export const SERVER_SUPPORTED_LANGUAGES = APP_LOCALES;

// 서버가 사용자 설정에서 허용하는 언어 코드입니다.
export type ServerSupportedLanguage = AppLocale;

// 서버 사용자 설정 테마 값입니다. 프론트 정책상 시스템 테마는 사용하지 않습니다.
export type UserSettingsThemeDto = "LIGHT" | "DARK";

// 사용자 설정 수정 요청에서 보낼 수 있는 테마 값입니다.
export type UpdateUserSettingsThemeDto = UserSettingsThemeDto;

export interface UserSettingsResponseDto {
  id: string;
  userId: string;
  theme: UserSettingsThemeDto;
  language: ServerSupportedLanguage;
}

export interface UpdateUserSettingsDto {
  theme?: UpdateUserSettingsThemeDto;
  language?: ServerSupportedLanguage;
}
