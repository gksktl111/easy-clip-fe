"use client";

// 사용자 설정 변경과 구독 정보를 표시하는 설정 도메인 모달입니다.
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineMoon,
  HiOutlineTranslate,
  HiOutlineX,
} from "react-icons/hi";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { persistUserSettings } from "@/features/settings/service/settingsService";
import { useMySubscription } from "@/features/subscription/hooks/useMySubscription";
import { MySubscriptionResponseDto } from "@/features/subscription/model/subscription.dto";
import { LOCALE_LABELS, type AppLocale } from "@/shared/config/locale";
import { useSettingsStore } from "@/shared/store/settingsStore";
import { Button } from "@/shared/ui/button/Button";
import { Select } from "@/shared/ui/input/Select";
import { Switch } from "@/shared/ui/input/Switch";
import { Modal } from "@/shared/ui/overlay/Modal";
import { Text } from "@/shared/ui/typography/Text";

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
  const subscription = subscriptionQuery.subscription;
  const isDark = theme === "dark";
  const isSubscriptionLoading = Boolean(
    session?.user && subscriptionQuery.isPending,
  );
  const subscriptionError = subscriptionQuery.isError
    ? t("subscriptionLoadError")
    : null;

  const formatNullableDate = (value: string | null) => {
    if (!value) {
      return t("subscriptionEmptyValue");
    }

    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const formatSubscriptionStatus = (
    status: MySubscriptionResponseDto["status"] | null | undefined,
  ) => {
    if (!status) {
      return t("subscriptionEmptyValue");
    }

    return t(`subscriptionStatusValues.${status}`);
  };

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
          <div>
            <Text variant="sectionLabel">
              {t("appearance")}
            </Text>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineMoon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <Text variant="itemTitle">{t("darkMode")}</Text>
                  <Text variant="caption">
                    {t("darkModeDescription")}
                  </Text>
                </div>
              </div>
              <Switch
                checked={isDark}
                onClick={() => {
                  void handleThemeToggle();
                }}
                disabled={savingField === "theme"}
                aria-label={t("toggleDarkMode")}
              />
            </div>
          </div>

          <div>
            <Text variant="sectionLabel">
              {t("general")}
            </Text>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineTranslate className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <Text variant="itemTitle">{t("language")}</Text>
                  <Text variant="caption">
                    {t("languageDescription")}
                  </Text>
                </div>
              </div>
              <Select
                value={language}
                onChange={(value) => {
                  void handleLanguageChange(value as AppLocale);
                }}
                disabled={savingField === "language"}
                options={Object.entries(LOCALE_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                )}
                className="min-w-36"
              />
            </div>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div>
            <Text variant="sectionLabel">{t("about")}</Text>
            <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <Text variant="itemTitle">{t("aboutTitle")}</Text>
              <Text variant="caption">{t("aboutDescription")}</Text>
            </div>
            <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineCreditCard className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <Text variant="itemTitle" className="text-left">
                    {t("subscriptionTitle")}
                  </Text>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
                    <div>
                      <Text as="dt" variant="caption">
                        {t("subscriptionPlan")}
                      </Text>
                      <dd className="mt-1 font-semibold">
                        {isSubscriptionLoading
                          ? t("subscriptionLoading")
                          : (subscription?.plan ?? t("subscriptionEmptyValue"))}
                      </dd>
                    </div>
                    <div>
                      <Text as="dt" variant="caption">
                        {t("subscriptionStatus")}
                      </Text>
                      <dd className="mt-1 font-semibold">
                        {isSubscriptionLoading
                          ? t("subscriptionLoading")
                          : formatSubscriptionStatus(subscription?.status)}
                      </dd>
                    </div>
                    <div>
                      <Text as="dt" variant="caption">
                        {t("subscriptionNextBillingAt")}
                      </Text>
                      <dd className="mt-1 font-semibold">
                        {formatNullableDate(
                          subscription?.nextBillingAt ?? null,
                        )}
                      </dd>
                    </div>
                  </dl>
                  {subscriptionError ? (
                    <Text variant="caption" className="mt-3">
                      {subscriptionError}
                    </Text>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
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
