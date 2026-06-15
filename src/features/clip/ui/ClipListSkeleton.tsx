"use client";

const SKELETON_CARD_COUNT = 8;

export function ClipListSkeleton() {
  return (
    <div className="clip-scrollbar flex-1 overflow-auto px-4 py-4 md:px-6">
      <div className="grid grid-cols-1 gap-4 min-[800px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1440px]:grid-cols-4">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex min-h-44 flex-col justify-between rounded-2xl border border-(--border) bg-(--surface) p-4"
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
            <div className="flex items-center justify-between gap-3 pt-6">
              <div className="skeleton-shimmer h-3 w-20 rounded-md" />
              <div className="skeleton-shimmer h-7 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
