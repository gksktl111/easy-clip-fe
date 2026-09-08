"use client";

import { useContext } from "react";
import { AuthContext } from "@/features/auth/client/AuthContext";

// Provider 밖에서 인증 상태를 소비하는 구성 오류를 즉시 드러냅니다.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
