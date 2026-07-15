import {
  fetchMySettings,
  updateMySettings,
} from "@/features/settings/api/settingsApi";
import {
  SERVER_SUPPORTED_LANGUAGES,
  ServerSupportedLanguage,
  UpdateUserSettingsDto,
  UpdateUserSettingsThemeDto,
  UserSettingsThemeDto,
} from "@/features/settings/model/settings.dto";
import {
  LanguageCode,
  ThemeMode,
  useSettingsStore,
} from "@/shared/store/settingsStore";

// 서버 DTO의 대문자 테마 값을 클라이언트 전역 설정 값으로 변환합니다.
const mapThemeFromServer = (theme: UserSettingsThemeDto): ThemeMode => {
  if (theme === "LIGHT") {
    return "light";
  }

  return "dark";
};

// 프론트 정책은 light/dark만 허용하므로 수정 요청에도 SYSTEM을 보내지 않습니다.
const mapThemeToServer = (theme: ThemeMode): UpdateUserSettingsThemeDto =>
  theme === "light" ? "LIGHT" : "DARK";

export const isServerSupportedLanguage = (
  language: LanguageCode,
): language is ServerSupportedLanguage =>
  SERVER_SUPPORTED_LANGUAGES.includes(language as ServerSupportedLanguage);

export const syncUserSettings = async () => {
  const settings = await fetchMySettings();
  const currentLanguage = useSettingsStore.getState().language;

  useSettingsStore.getState().hydrateFromServer({
    theme: mapThemeFromServer(settings.theme),
    language: isServerSupportedLanguage(currentLanguage)
      ? settings.language
      : undefined,
  });

  return settings;
};

export const persistUserSettings = async (
  nextSettings: {
    theme?: ThemeMode;
    language?: LanguageCode;
  },
) => {
  const payload: UpdateUserSettingsDto = {};

  if (nextSettings.theme) {
    payload.theme = mapThemeToServer(nextSettings.theme);
  }

  if (
    nextSettings.language &&
    isServerSupportedLanguage(nextSettings.language)
  ) {
    payload.language = nextSettings.language;
  }

  if (!payload.theme && !payload.language) {
    return null;
  }

  const settings = await updateMySettings(payload);

  useSettingsStore.getState().hydrateFromServer({
    theme: mapThemeFromServer(settings.theme),
    language: payload.language ? settings.language : undefined,
  });

  return settings;
};
