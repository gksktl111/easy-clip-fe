import "server-only";

import { cookies } from "next/headers";
import type { UserSettingsResponseDto } from "@/features/settings/model/settings.dto";
import { buildApiUrl } from "@/shared/config/env";
import {
  DEFAULT_LOCALE,
  isAppLocale,
  type AppLocale,
} from "@/shared/config/locale";
import {
  DEFAULT_THEME,
  LANGUAGE_COOKIE_NAME,
  THEME_COOKIE_NAME,
  isThemeMode,
  type ThemeMode,
} from "@/shared/config/settings";

type InitialUserSettingsSource = "server" | "fallback";

export interface InitialUserSettings {
  language: AppLocale;
  source: InitialUserSettingsSource;
  theme: ThemeMode;
}

const buildFallbackSettings = (
  theme: ThemeMode,
  language: AppLocale,
): InitialUserSettings => ({
  language,
  source: "fallback",
  theme,
});

const mapThemeFromServer = (
  theme: UserSettingsResponseDto["theme"],
): ThemeMode => {
  if (theme === "LIGHT") {
    return "light";
  }

  return "dark";
};

const buildCookieHeader = (
  requestCookies: Array<{ name: string; value: string }>,
) => {
  if (requestCookies.length === 0) {
    return null;
  }

  return requestCookies
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
};

interface GetInitialUserSettingsOptions {
  shouldFetchServerSettings?: boolean;
}

export async function getInitialUserSettings({
  shouldFetchServerSettings = true,
}: GetInitialUserSettingsOptions = {}): Promise<InitialUserSettings> {
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const storedLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const fallbackSettings = buildFallbackSettings(
    isThemeMode(storedTheme) ? storedTheme : DEFAULT_THEME,
    storedLanguage && isAppLocale(storedLanguage)
      ? storedLanguage
      : DEFAULT_LOCALE,
  );

  if (!shouldFetchServerSettings) {
    return fallbackSettings;
  }

  const cookieHeader = buildCookieHeader(cookieStore.getAll());

  if (!cookieHeader) {
    return fallbackSettings;
  }

  try {
    const response = await fetch(buildApiUrl("/users/me/settings"), {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return fallbackSettings;
    }

    const settings = (await response.json()) as UserSettingsResponseDto;

    return {
      language: isAppLocale(settings.language)
        ? settings.language
        : fallbackSettings.language,
      source: "server",
      theme: mapThemeFromServer(settings.theme),
    };
  } catch {
    return fallbackSettings;
  }
}
