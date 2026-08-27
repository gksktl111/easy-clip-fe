"use client";

import { createContext } from "react";
import type {
  AuthSession,
  AuthStatus,
  CurrentUser,
} from "@/features/auth/model/auth";

export interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  error: Error | null;
  restoreSession: () => Promise<AuthSession | null>;
  logout: () => Promise<void>;
}

// 여러 feature가 사용하는 최소 인증 상태 계약입니다.
export const AuthContext = createContext<AuthContextValue | null>(null);
