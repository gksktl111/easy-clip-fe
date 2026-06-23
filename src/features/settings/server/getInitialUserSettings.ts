import { cookies } from "next/headers";
import type { UserSettingsResponseDto } from "@/features/settings/model/settings.dto";
import { buildApiUrl } from "@/shared/config/env";
import {
  DEFAULT_LOCALE,
  isAppLocale,
  type AppLocale,
} from "@/shared/config/locale";
import { DEFAULT_THEME, type ThemeMode } from "@/shared/config/settings";

type InitialUserSettingsSource = "server" | "fallback";

export interface InitialUserSettings {
  language: AppLocale;
  source: InitialUserSettingsSource;
  theme: ThemeMode;
}

const FALLBACK_SETTINGS: InitialUserSettings = {
  language: DEFAULT_LOCALE,
  source: "fallback",
  theme: DEFAULT_THEME,
};

const mapThemeFromServer = (
  theme: UserSettingsResponseDto["theme"],
): ThemeMode => {
  if (theme === "LIGHT") {
    return "light";
  }

  return "dark";
};

const buildCookieHeader = async () => {
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();

  if (requestCookies.length === 0) {
    return null;
  }

  return requestCookies
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
};

export async function getInitialUserSettings(): Promise<InitialUserSettings> {
  const cookieHeader = await buildCookieHeader();

  if (!cookieHeader) {
    return FALLBACK_SETTINGS;
  }

  try {
    const response = await fetch(buildApiUrl("/users/me/settings"), {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return FALLBACK_SETTINGS;
    }

    const settings = (await response.json()) as UserSettingsResponseDto;

    return {
      language: isAppLocale(settings.language)
        ? settings.language
        : FALLBACK_SETTINGS.language,
      source: "server",
      theme: mapThemeFromServer(settings.theme),
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}
