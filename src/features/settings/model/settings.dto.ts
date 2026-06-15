export const SERVER_SUPPORTED_LANGUAGES = ["ko", "en"] as const;

export type ServerSupportedLanguage =
  (typeof SERVER_SUPPORTED_LANGUAGES)[number];

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
