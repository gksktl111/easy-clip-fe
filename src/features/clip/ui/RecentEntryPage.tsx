"use client";

import { ClipEntryPage } from "@/features/clip/ui/ClipEntryPage";
import { RecentClipsPage } from "@/features/clip/ui/RecentClipsPage";

// 최근 클립 기본 경로를 폴더 기준 경로 또는 빈 폴더 대체 화면으로 연결합니다.
export function RecentEntryPage() {
  return <ClipEntryPage section="recent" fallback={<RecentClipsPage />} />;
}
