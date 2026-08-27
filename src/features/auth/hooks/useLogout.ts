"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

// 사용자 의도로 시작한 로그아웃의 화면 전환을 인증 상태 관리와 분리합니다.
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);

  const handleLogout = useCallback(async () => {
    if (isPendingRef.current) {
      return;
    }

    isPendingRef.current = true;
    setIsPending(true);

    try {
      await logout();
      router.replace("/login");
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }, [logout, router]);

  return { handleLogout, isPending };
}
