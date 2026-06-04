import { DEFAULT_LOCALE, type AppLocale } from "@/shared/config/locale";

export async function getUserLocaleSetting(): Promise<AppLocale | null> {
  return null;
}

export async function getInitialLocale(): Promise<AppLocale> {
  const locale = await getUserLocaleSetting();

  return locale ?? DEFAULT_LOCALE;
}
