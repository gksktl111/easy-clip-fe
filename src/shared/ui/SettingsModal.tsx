"use client";

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
import { StyledSelect } from "@/shared/ui/StyledSelect";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--overlay-strong) px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="text-foreground relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface-elevated) shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div className="flex items-center gap-3 text-base font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--modal-icon-bg) text-(--modal-icon-fg)">
              <HiOutlineCog className="h-5 w-5" aria-hidden />
            </span>
            {t("title")}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-(--surface-muted)"
            aria-label={t("close")}
          >
            <HiOutlineX className="h-5 w-5 text-(--muted)" aria-hidden />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <p className="text-sm font-semibold text-(--muted)">
              {t("appearance")}
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineMoon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("darkMode")}</p>
                  <p className="text-xs text-(--muted)">
                    {t("darkModeDescription")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleThemeToggle();
                }}
                disabled={savingField === "theme"}
                className={`relative h-7 w-12 cursor-pointer rounded-full transition ${
                  isDark ? "bg-(--primary)" : "bg-(--border)"
                }`}
                aria-label={t("toggleDarkMode")}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    isDark ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--muted)">
              {t("general")}
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineTranslate className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("language")}</p>
                  <p className="text-xs text-(--muted)">
                    {t("languageDescription")}
                  </p>
                </div>
              </div>
              <StyledSelect
                value={language}
                onChange={(value) => {
                  void handleLanguageChange(value as AppLocale);
                }}
                disabled={savingField === "language"}
                options={Object.entries(LOCALE_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
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
            <p className="text-sm font-semibold text-(--muted)">
              {t("about")}
            </p>
            <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <p className="text-sm font-semibold">{t("aboutTitle")}</p>
              <p className="text-xs text-(--muted)">{t("aboutDescription")}</p>
            </div>
            <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineCreditCard className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-left text-sm font-semibold">
                    {t("subscriptionTitle")}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
                    <div>
                      <dt className="text-xs text-(--muted)">
                        {t("subscriptionPlan")}
                      </dt>
                      <dd className="mt-1 font-semibold">
                        {isSubscriptionLoading
                          ? t("subscriptionLoading")
                          : (subscription?.plan ?? t("subscriptionEmptyValue"))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-(--muted)">
                        {t("subscriptionStatus")}
                      </dt>
                      <dd className="mt-1 font-semibold">
                        {isSubscriptionLoading
                          ? t("subscriptionLoading")
                          : formatSubscriptionStatus(subscription?.status)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-(--muted)">
                        {t("subscriptionNextBillingAt")}
                      </dt>
                      <dd className="mt-1 font-semibold">
                        {formatNullableDate(subscription?.nextBillingAt ?? null)}
                      </dd>
                    </div>
                  </dl>
                  {subscriptionError ? (
                    <p className="mt-3 text-xs text-(--muted)">
                      {subscriptionError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-(--border) px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-(--primary) px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-(--primary-hover)"
          >
            {t("closeButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
