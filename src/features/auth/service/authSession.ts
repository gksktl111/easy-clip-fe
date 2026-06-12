"use client";

import { AuthSession } from "@/features/auth/model/auth";

const AUTH_SESSION_STORAGE_KEY = "easy-clip-auth-session";
const AUTH_SESSION_EVENT = "auth-session:change";

const dispatchSessionChange = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const readAuthSession = (): AuthSession | null => {
  const stored =
    typeof window === "undefined"
      ? null
      : localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
};

export const persistAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  dispatchSessionChange();
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  dispatchSessionChange();
};

export const subscribeToAuthSession = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(AUTH_SESSION_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AUTH_SESSION_EVENT, handler);
  };
};
