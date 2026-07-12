"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HiOutlineCog, HiOutlineX } from "react-icons/hi";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { persistUserSettings } from "@/features/settings/service/settingsService";
import { SettingsAboutSection } from "@/features/settings/ui/SettingsAboutSection";
import { SettingsPreferencesSection } from "@/features/settings/ui/SettingsPreferencesSection";
import { useMySubscription } from "@/features/subscription/hooks/useMySubscription";
import type { AppLocale } from "@/shared/config/locale";
import { useSettingsStore } from "@/shared/store/settingsStore";
import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

// 사용자 설정 저장 상태를 관리하고 환경 설정과 구독 정보 섹션을 조합합니다.
interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const t = useTranslations("settings");
  const session = useAuthSession();
  const subscriptionQuery = useMySubscription();
  const { theme, language, setLanguage, setTheme } = useSettingsStore();
  const [savingField, setSavingField] = useState<"theme" | "language" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isDark = theme === "dark";
  const isSubscriptionLoading = Boolean(
    session?.user && subscriptionQuery.isPending,
  );
  const subscriptionError = subscriptionQuery.isError
    ? t("subscriptionLoadError")
    : null;

  const handleThemeToggle = async () => {
    const previousTheme = theme;
    const nextTheme = isDark ? "light" : "dark";

    setErrorMessage(null);
    setTheme(nextTheme);

    if (!session?.user) {
      return;
    }

    setSavingField("theme");

    try {
      await persistUserSettings({ theme: nextTheme });
    } catch {
      setTheme(previousTheme);
      setErrorMessage(t("saveError"));
    } finally {
      setSavingField(null);
    }
  };

  const handleLanguageChange = async (nextLanguage: AppLocale) => {
    const previousLanguage = language;

    setErrorMessage(null);
    setLanguage(nextLanguage);

    if (!session?.user) {
      return;
    }

    setSavingField("language");

    try {
      await persistUserSettings({ language: nextLanguage });
    } catch {
      setLanguage(previousLanguage);
      setErrorMessage(t("saveError"));
    } finally {
      setSavingField(null);
    }
  };

  return (
    <Modal
      overlay="strong"
      onClose={onClose}
      contentClassName="w-full max-w-2xl"
    >
      <div className="text-foreground relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface-elevated) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div className="flex items-center gap-3 text-base font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--modal-icon-bg) text-(--modal-icon-fg)">
              <HiOutlineCog className="h-5 w-5" aria-hidden />
            </span>
            {t("title")}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label={t("close")}
          >
            <HiOutlineX className="h-5 w-5 text-(--muted)" aria-hidden />
          </Button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <SettingsPreferencesSection
            isDark={isDark}
            language={language}
            savingField={savingField}
            onThemeToggle={() => {
              void handleThemeToggle();
            }}
            onLanguageChange={(nextLanguage) => {
              void handleLanguageChange(nextLanguage);
            }}
          />

          {errorMessage ? (
            <p
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <SettingsAboutSection
            subscription={subscriptionQuery.subscription}
            isLoading={isSubscriptionLoading}
            errorMessage={subscriptionError}
            language={language}
          />
        </div>

        <div className="flex items-center justify-end border-t border-(--border) px-6 py-4">
          <Button
            onClick={onClose}
            variant="primary"
            size="sm"
            className="px-5 font-semibold"
          >
            {t("closeButton")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
