"use client";

import { createContext } from "react";
import type {
  CurrentUser,
  SessionStatus,
  UserSession,
} from "@/shared/session/session";

export interface SessionContextValue {
  status: SessionStatus;
  user: CurrentUser | null;
  error: Error | null;
  restoreSession: () => Promise<UserSession | null>;
  logout: () => Promise<void>;
}

// app 소유 Provider와 여러 feature가 공유하는 최소 사용자 세션 계약입니다.
export const SessionContext = createContext<SessionContextValue | null>(null);
