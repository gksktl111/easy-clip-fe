"use client";

import { AuthSession } from "@/features/auth/model/auth";

const AUTH_SESSION_STORAGE_KEY = "easy-clip-auth-session";
const AUTH_SESSION_EVENT = "auth-session:change";
let cachedSessionRaw: string | null | undefined;
let cachedSession: AuthSession | null = null;

const dispatchSessionChange = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const readAuthSession = (): AuthSession | null => {
  const stored =
    typeof window === "undefined"
      ? null
      : localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (stored === cachedSessionRaw) {
    return cachedSession;
  }

  if (!stored) {
    cachedSessionRaw = null;
    cachedSession = null;
    return null;
  }

  try {
    cachedSessionRaw = stored;
    cachedSession = JSON.parse(stored) as AuthSession;
    return cachedSession;
  } catch {
    cachedSessionRaw = null;
    cachedSession = null;
    return null;
  }
};

export const persistAuthSession = (session: AuthSession) => {
  const serializedSession = JSON.stringify(session);
  cachedSessionRaw = serializedSession;
  cachedSession = session;
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, serializedSession);
  dispatchSessionChange();
};

export const clearAuthSession = () => {
  cachedSessionRaw = null;
  cachedSession = null;
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
