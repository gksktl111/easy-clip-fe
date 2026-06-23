import Link from "next/link";
import { HiArrowLeft, HiOutlineCreditCard } from "react-icons/hi";

export function BillingHeroSection() {
  return (
    <div className="flex flex-col justify-center">
      <Link
        href="/pricing"
        className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-(--muted) transition hover:text-(--foreground)"
      >
        <HiArrowLeft className="h-4 w-4" aria-hidden />
        요금제로 돌아가기
      </Link>

      <div className="mt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-sm text-(--muted)">
          <HiOutlineCreditCard className="h-4 w-4" aria-hidden />
          Pro subscription
        </div>
        <h1 className="mt-5 text-3xl leading-tight font-semibold">
          Pro로 업그레이드
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-(--muted)">
          월 3,900원으로 프로젝트와 기기 제한을 확장합니다. 카드 인증이 완료되면
          서버에서 구독 상태를 Pro로 갱신합니다.
        </p>
      </div>
    </div>
  );
}
