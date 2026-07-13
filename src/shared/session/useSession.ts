"use client";

import { useContext } from "react";
import { SessionContext } from "@/shared/session/sessionContext";

// Provider 밖에서 세션 상태를 소비하는 구성 오류를 즉시 드러냅니다.
export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
};
