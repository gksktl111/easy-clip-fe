import {
  fetchMySettings,
  updateMySettings,
} from "@/features/settings/api/settingsApi";
import {
  SERVER_SUPPORTED_LANGUAGES,
  ServerSupportedLanguage,
  UpdateUserSettingsDto,
  UserSettingsThemeDto,
} from "@/features/settings/model/settings.dto";
import {
  LanguageCode,
  ThemeMode,
  useSettingsStore,
} from "@/shared/store/settingsStore";

const getSystemTheme = (): ThemeMode => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

const mapThemeFromServer = (theme: UserSettingsThemeDto): ThemeMode => {
  if (theme === "LIGHT") {
    return "light";
  }

  if (theme === "DARK") {
    return "dark";
  }

  return getSystemTheme();
};

const mapThemeToServer = (theme: ThemeMode): UserSettingsThemeDto =>
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
