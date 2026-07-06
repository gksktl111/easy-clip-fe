"use client";

import { useCallback, useSyncExternalStore } from "react";
import { AuthSession } from "@/features/auth/model/auth";
import {
  readAuthSession,
  subscribeToAuthSession,
} from "@/features/auth/service/authSession";

export const useAuthSession = () => {
  const getSnapshot = useCallback(() => readAuthSession(), []);

  return useSyncExternalStore<AuthSession | null>(
    subscribeToAuthSession,
    getSnapshot,
    () => null,
  );
};
