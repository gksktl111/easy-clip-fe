"use client";

// 앱 전역에서 사용하는 토스트 알림 렌더러입니다.
import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton={false}
      duration={3000}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "bg-transparent p-0 shadow-none",
        },
      }}
    />
  );
}
