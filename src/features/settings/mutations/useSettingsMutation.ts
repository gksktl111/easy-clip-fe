"use client";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTranslator, useTranslations } from "next-intl";
import { useAuth } from "@/features/auth";
import { persistUserSettings } from "@/features/settings/service/settingsService";
import { messagesByLocale } from "@/shared/config/messages";
import type { AppLocale } from "@/shared/config/locale";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { useSettingsStore, type ThemeMode } from "@/shared/store/settingsStore";

type SettingsChange =
  | { field: "theme"; value: ThemeMode }
  | { field: "language"; value: AppLocale };

export function useSettingsMutation() {
  const { user } = useAuth();
  const t = useTranslations("settings");
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const pending = useRef(false);
  const mutation = useMutation({
    mutationFn: (change: SettingsChange) =>
      user
        ? persistUserSettings({ [change.field]: change.value })
        : Promise.resolve(null),
    onMutate: (change) => {
      const previous = useSettingsStore.getState();
      if (change.field === "theme") previous.setTheme(change.value);
      else previous.setLanguage(change.value);
      return { theme: previous.theme, language: previous.language };
    },
    onSuccess: (_result, change) => {
      const locale = change.field === "language" ? change.value : language;
      const feedback = createTranslator({
        locale,
        messages: messagesByLocale[locale],
        namespace: "feedback",
      });
      notifySuccess(feedback("settingsSaved"));
    },
    onError: (_error, change, previous) => {
      if (previous) {
        const store = useSettingsStore.getState();
        if (change.field === "theme") store.setTheme(previous.theme);
        else store.setLanguage(previous.language);
      }
      notifyError(t("saveError"));
    },
  });

  const save = async (change: SettingsChange) => {
    if (pending.current) return;
    pending.current = true;
    try {
      await mutation.mutateAsync(change);
    } catch {
      // mutation의 onError가 이전 값 복원과 사용자 안내를 수행합니다.
    } finally {
      pending.current = false;
    }
  };

  return {
    isDark: theme === "dark",
    language,
    savingField: mutation.isPending
      ? (mutation.variables?.field ?? null)
      : null,
    handleThemeToggle: () =>
      save({ field: "theme", value: theme === "dark" ? "light" : "dark" }),
    handleLanguageChange: (value: AppLocale) => {
      if (value !== language) void save({ field: "language", value });
    },
  };
}
