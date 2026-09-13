"use client";

import { useTranslations } from "next-intl";
import { notifyError, notifySuccess } from "@/shared/feedback/toast";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

// 사용자 의도로 시작한 로그아웃의 화면 전환을 인증 상태 관리와 분리합니다.
export function useLogout() {
  const t = useTranslations("feedback");
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
      notifySuccess(t("loggedOut"));
      router.replace("/login");
    } catch {
      notifyError(t("logoutFailed"));
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }, [logout, router, t]);

  return { handleLogout, isPending };
}
