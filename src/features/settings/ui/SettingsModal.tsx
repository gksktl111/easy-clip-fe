"use client";

import { useTranslations } from "next-intl";
import { HiOutlineCog, HiOutlineX } from "react-icons/hi";
import { SettingsAboutSection } from "@/features/settings/ui/SettingsAboutSection";
import { SettingsPreferencesSection } from "@/features/settings/ui/SettingsPreferencesSection";
import { useMySubscription } from "@/features/subscription";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button/Button";
import { useSettingsMutation } from "@/features/settings/mutations/useSettingsMutation";
import { Modal } from "@/shared/ui/overlay/Modal";

// 사용자 설정 저장 상태를 관리하고 환경 설정과 구독 정보 섹션을 조합합니다.
interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const subscriptionQuery = useMySubscription();
  const {
    isDark,
    language,
    savingField,
    handleThemeToggle,
    handleLanguageChange,
  } = useSettingsMutation();
  const isSubscriptionLoading = Boolean(user && subscriptionQuery.isPending);
  const subscriptionError = subscriptionQuery.isError
    ? t("subscriptionLoadError")
    : null;

  return (
    <Modal
      ariaLabel={t("title")}
      overlay="strong"
      onClose={onClose}
      contentClassName="w-full max-w-2xl"
    >
      <div className="text-foreground relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface-elevated) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div className="flex items-center gap-3 text-base font-semibold">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-(--muted)">
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
