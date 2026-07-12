"use client";

import { useClipCollectionPage } from "@/features/clip/hooks/useClipCollectionPage";

// 즐겨찾기 클립 query와 복사·즐겨찾기 해제 액션을 페이지 계약으로 제공합니다.
export const useFavoriteClipsPage = () =>
  useClipCollectionPage({ favorite: true, supportsFavoriteToggle: true });
