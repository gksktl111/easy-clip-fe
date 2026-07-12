"use client";

import { useTranslations } from "next-intl";
import { HiOutlineMoon, HiOutlineTranslate } from "react-icons/hi";
import { LOCALE_LABELS, type AppLocale } from "@/shared/config/locale";
import { Select } from "@/shared/ui/input/Select";
import { Switch } from "@/shared/ui/input/Switch";
import { Text } from "@/shared/ui/typography/Text";

// 테마와 언어 설정을 각각의 입력 컨트롤과 저장 상태로 표시합니다.
interface SettingsPreferencesSectionProps {
  isDark: boolean;
  language: AppLocale;
  onLanguageChange: (language: AppLocale) => void;
  onThemeToggle: () => void;
  savingField: "language" | "theme" | null;
}

export function SettingsPreferencesSection({
  isDark,
  language,
  onLanguageChange,
  onThemeToggle,
  savingField,
}: SettingsPreferencesSectionProps) {
  const t = useTranslations("settings");

  return (
    <>
      <section>
        <Text variant="sectionLabel">{t("appearance")}</Text>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
              <HiOutlineMoon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <Text variant="itemTitle">{t("darkMode")}</Text>
              <Text variant="caption">{t("darkModeDescription")}</Text>
            </div>
          </div>
          <Switch
            checked={isDark}
            onClick={onThemeToggle}
            disabled={savingField === "theme"}
            aria-label={t("toggleDarkMode")}
          />
        </div>
      </section>

      <section>
        <Text variant="sectionLabel">{t("general")}</Text>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
              <HiOutlineTranslate className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <Text variant="itemTitle">{t("language")}</Text>
              <Text variant="caption">{t("languageDescription")}</Text>
            </div>
          </div>
          <Select
            value={language}
            onChange={(value) => onLanguageChange(value as AppLocale)}
            disabled={savingField === "language"}
            options={Object.entries(LOCALE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            className="min-w-36"
          />
        </div>
      </section>
    </>
  );
}
