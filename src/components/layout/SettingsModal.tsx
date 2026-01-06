"use client";

import {
  HiOutlineCog,
  HiOutlineMoon,
  HiOutlineTranslate,
  HiOutlineX,
} from "react-icons/hi";
import { applySettings, useSettingsStore } from "../../store/settingsStore";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, language, setLanguage, toggleTheme } = useSettingsStore();
  const isDark = theme === "dark";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
    const nextTheme = theme === "dark" ? "light" : "dark";
    applySettings(nextTheme, language);
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextLanguage = event.target.value === "ko" ? "ko" : "en";
    setLanguage(nextLanguage);
    applySettings(theme, nextLanguage);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-xl ${
          isDark
            ? "border-white/10 bg-[#1e1e1f] text-slate-100"
            : "border-gray-200 bg-white text-gray-900"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isDark ? "border-white/10" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 text-base font-semibold">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isDark
                  ? "bg-white/10 text-slate-100"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <HiOutlineCog className="h-5 w-5" aria-hidden />
            </span>
            Settings
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition ${
              isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
            aria-label="Close settings"
          >
            <HiOutlineX
              className={`h-5 w-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              aria-hidden
            />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <p className="text-sm font-semibold text-gray-400">Appearance</p>
            <div
              className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-3 ${
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isDark
                      ? "bg-white/10 text-gray-200"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <HiOutlineMoon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold">Dark Mode</p>
                  <p className="text-xs text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleTheme}
                className={`relative h-7 w-12 cursor-pointer rounded-full transition ${
                  isDark ? "bg-blue-600" : "bg-gray-300"
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
            <p className="text-sm font-semibold text-gray-400">General</p>
            <div
              className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-3 ${
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isDark
                      ? "bg-white/10 text-gray-200"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <HiOutlineTranslate className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold">Language</p>
                  <p className="text-xs text-gray-400">
                    Select your preferred language
                  </p>
                </div>
              </div>
              <select
                value={language}
                onChange={handleLanguageChange}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  isDark
                    ? "border-white/10 bg-[#2a2a2b] text-gray-200"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-400">About</p>
            <div
              className={`mt-3 rounded-xl border px-4 py-3 ${
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className="text-sm font-semibold">Clipboard Studio v1.0.0</p>
              <p className="text-xs text-gray-400">
                A modern clipboard manager for designers and developers
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-end border-t px-6 py-4 ${
            isDark ? "border-white/10" : "border-gray-200"
          }`}
        >
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
