import Link from "next/link";
import { useTranslations } from "next-intl";
import { HiArrowLeft } from "react-icons/hi";

// 요금제 복귀 링크와 Pro 업그레이드 목적을 결제 화면 상단에 안내합니다.
export function BillingHeroSection() {
  const t = useTranslations("billing");
  return (
    <div className="flex flex-col justify-center">
      <Link
        href="/pricing"
        className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-(--muted) transition hover:text-(--foreground)"
      >
        <HiArrowLeft className="h-4 w-4" aria-hidden />
        {t("back")}
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl leading-tight font-semibold text-balance break-keep-ko">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-(--muted)">
          {t("description")}
        </p>
      </div>
    </div>
  );
}
