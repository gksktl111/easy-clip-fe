"use client";

import { ClipItemSkeleton } from "@/features/clip/ui/ClipItemSkeleton";

const SKELETON_CARD_COUNT = 8;

// 클립 목록을 불러오는 동안 실제 그리드와 같은 형태의 로딩 카드를 표시합니다.
export function ClipListSkeleton() {
  return (
    <div className="clip-scrollbar flex-1 overflow-auto px-4 py-4 md:px-6">
      <div className="grid grid-cols-1 gap-4 min-[800px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1440px]:grid-cols-4">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <ClipItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
