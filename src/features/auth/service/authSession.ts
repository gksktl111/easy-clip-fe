"use client";

import { AuthSession } from "@/features/auth/model/auth";

const AUTH_SESSION_EVENT = "auth-session:change";
let cachedSession: AuthSession | null = null;

const dispatchSessionChange = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const readAuthSession = (): AuthSession | null => cachedSession;

export const persistAuthSession = (session: AuthSession) => {
  cachedSession = session;
  // 인증 토큰은 httpOnly 쿠키에만 두고, 클라이언트에는 사용자 상태만 보관한다.
  dispatchSessionChange();
};

export const clearAuthSession = () => {
  cachedSession = null;
  dispatchSessionChange();
};

export const subscribeToAuthSession = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener(AUTH_SESSION_EVENT, handler);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, handler);
  };
};
