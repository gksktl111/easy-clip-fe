"use client";

// 초기 조회와 생성 대기 상태에서 실제 클립 카드 크기를 유지합니다.
export function ClipItemSkeleton() {
  return (
    <article
      className="flex h-52 w-full flex-col justify-between rounded-2xl border border-(--border) bg-(--surface) p-4"
      aria-hidden
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton-shimmer h-5 w-24 rounded-md" />
          <div className="skeleton-shimmer h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded-md" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
          <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-(--border) pt-3">
        <div className="skeleton-shimmer h-6 w-6 rounded-md" />
        <div className="skeleton-shimmer h-3 w-24 rounded-md" />
      </div>
    </article>
  );
}
