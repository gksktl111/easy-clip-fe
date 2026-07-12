"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CopyToastPosition {
  x: number;
  y: number;
}

// 복사 피드백의 화면 위치와 자동 닫기 타이머 수명주기를 관리합니다.
export const useCopyToast = () => {
  const [copyToast, setCopyToast] = useState<CopyToastPosition | null>(null);
  const copyToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current);
      }
    };
  }, []);

  const showCopyToast = useCallback((x: number, y: number) => {
    setCopyToast({ x, y });
    if (copyToastTimerRef.current) {
      window.clearTimeout(copyToastTimerRef.current);
    }
    copyToastTimerRef.current = window.setTimeout(() => {
      setCopyToast(null);
    }, 3000);
  }, []);

  return {
    copyToast,
    showCopyToast,
  };
};
