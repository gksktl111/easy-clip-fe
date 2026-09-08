import type { ReactNode } from "react";

// 데이터가 없을 때 아이콘, 제목, 설명을 카드 형태로 안내하는 공통 빈 상태 UI입니다.
interface EmptyStateCardProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  className?: string;
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function EmptyStateCard({
  icon,
  title,
  description,
  className,
}: EmptyStateCardProps) {
  return (
    <div
      className={classNames(
        "flex max-w-sm flex-col items-center rounded-3xl border border-dashed border-(--border) bg-(--surface) px-8 py-10 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center text-(--muted) [&>svg]:h-8 [&>svg]:w-8"
      >
        {icon}
      </div>
      <p className="mt-4 text-base font-semibold text-(--foreground)">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        {description}
      </p>
    </div>
  );
}
