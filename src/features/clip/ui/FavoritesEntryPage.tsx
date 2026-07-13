"use client";

import { ClipEntryPage } from "@/features/clip/ui/ClipEntryPage";
import { FavoriteClipsPage } from "@/features/clip/ui/FavoriteClipsPage";

// 즐겨찾기 기본 경로를 폴더 기준 경로 또는 빈 폴더 대체 화면으로 연결합니다.
export function FavoritesEntryPage() {
  return <ClipEntryPage section="favorites" fallback={<FavoriteClipsPage />} />;
}
