"use client";

import {
  HiOutlineCog,
  HiOutlineMoon,
  HiOutlineTranslate,
  HiOutlineX,
} from "react-icons/hi";
import { applySettings, useSettingsStore } from "@/shared/store/settingsStore";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, language, setLanguage, toggleTheme } = useSettingsStore();
  const isDark = theme === "dark";

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
        className="text-foreground relative w-full max-w-2xl rounded-2xl border border-(--border) bg-(--surface-elevated) shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div className="flex items-center gap-3 text-base font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--modal-icon-bg) text-(--modal-icon-fg)">
              <HiOutlineCog className="h-5 w-5" aria-hidden />
            </span>
            Settings
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-(--surface-muted)"
            aria-label="Close settings"
          >
            <HiOutlineX className="h-5 w-5 text-(--muted)" aria-hidden />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <p className="text-sm font-semibold text-(--muted)">Appearance</p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineMoon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold">Dark Mode</p>
                  <p className="text-xs text-(--muted)">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  applySettings(theme === "dark" ? "light" : "dark", language);
                }}
                className={`relative h-7 w-12 cursor-pointer rounded-full transition ${
                  isDark ? "bg-(--primary)" : "bg-(--border)"
                }`}
                aria-label="Toggle dark mode"
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
            <p className="text-sm font-semibold text-(--muted)">General</p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--modal-icon-bg) text-(--modal-icon-fg)">
                  <HiOutlineTranslate className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold">Language</p>
                  <p className="text-xs text-(--muted)">
                    Select your preferred language
                  </p>
                </div>
              </div>
              <select
                value={language}
                onChange={(event) => {
                  const nextLanguage =
                    event.target.value === "ko" ? "ko" : "en";
                  setLanguage(nextLanguage);
                  applySettings(theme, nextLanguage);
                }}
                className="cursor-pointer rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-sm text-(--foreground) focus:border-(--focus-ring) focus:outline-none"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--muted)">About</p>
            <div className="mt-3 rounded-xl border border-(--border) bg-(--modal-section-bg) px-4 py-3">
              <p className="text-sm font-semibold">Clipboard Studio v1.0.0</p>
              <p className="text-xs text-(--muted)">
                A modern clipboard manager for designers and developers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-(--border) px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-(--primary) px-5 py-2 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
