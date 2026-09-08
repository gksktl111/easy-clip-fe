import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import koMessages from "@/messages/ko.json";
import zhMessages from "@/messages/zh.json";

export const messagesByLocale = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
} as const;
