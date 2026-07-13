// 사용자 후기를 연속 배너 형태로 반복 노출합니다.
interface LandingReview {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

interface LandingReviewsBannerProps {
  reviews: readonly LandingReview[];
}

function LandingReviewCard({ review }: { review: LandingReview }) {
  return (
    <article className="flex min-h-52 w-[20rem] shrink-0 flex-col justify-between rounded-[1.75rem] border border-(--border) bg-(--surface) p-6 md:w-[22rem]">
      <p className="text-base leading-8 font-medium tracking-[-0.01em] text-(--foreground)">
        &ldquo;{review.quote}&rdquo;
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--surface-muted) text-sm font-semibold text-(--foreground)">
          {review.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-(--foreground)">
            {review.name}
          </p>
          <p className="mt-1 text-xs text-(--muted)">{review.role}</p>
        </div>
      </div>
    </article>
  );
}

export function LandingReviewsBanner({ reviews }: LandingReviewsBannerProps) {
  return (
    <section className="mt-16 mb-[100px] overflow-x-clip">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
          추천 작업 전문가들이 선택했습니다
        </h3>
        <p className="mt-3 text-sm text-(--muted) md:text-base">
          클립보드 흐름이 바뀐 사용자들의 실제 후기를 확인해보세요.
        </p>
      </div>

      <div className="mt-10 overflow-hidden py-2 [--marquee-gap:1.25rem] md:[--marquee-gap:1.5rem]">
        <div className="px-6 md:px-8">
          <div
            className="flex w-max gap-[var(--marquee-gap)] will-change-transform"
            style={{
              animation: "marquee-x 40s linear infinite",
            }}
          >
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex shrink-0 gap-[var(--marquee-gap)]"
              >
                {reviews.map((review, reviewIndex) => (
                  <LandingReviewCard
                    key={`${groupIndex}-${review.name}-${reviewIndex}`}
                    review={review}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
