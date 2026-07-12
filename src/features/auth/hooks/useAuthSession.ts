"use client";

import { useSyncExternalStore } from "react";
import type { AuthSession } from "@/features/auth/model/auth";
import {
  readAuthSession,
  subscribeToAuthSession,
} from "@/features/auth/service/authSession";

// 인증 세션 store를 구독하고 서버 렌더링에서는 비로그인 snapshot을 제공합니다.
export const useAuthSession = () =>
  useSyncExternalStore<AuthSession | null>(
    subscribeToAuthSession,
    readAuthSession,
    () => null,
  );
