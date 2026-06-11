import { getRequestConfig } from "next-intl/server";
import { DEFAULT_TIME_ZONE } from "@/shared/config/locale";
import { getInitialLocale } from "@/shared/server/getUserLocale";

export default getRequestConfig(async () => {
  const locale = await getInitialLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: DEFAULT_TIME_ZONE,
  };
});
