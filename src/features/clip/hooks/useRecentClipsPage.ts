"use client";

import { useClipCollectionPage } from "@/features/clip/hooks/useClipCollectionPage";

// 최근 사용한 클립 query와 공통 컬렉션 인터랙션을 페이지 계약으로 제공합니다.
export const useRecentClipsPage = () => useClipCollectionPage({ recent: true });
