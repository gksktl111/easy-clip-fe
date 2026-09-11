import { HiCheck } from "react-icons/hi";
import { useTranslations } from "next-intl";

const PRO_UNLOCKED_FEATURES = ["projects", "clips", "organization"] as const;

// Pro 구독으로 사용할 수 있는 기능을 체크 목록으로 안내합니다.
export function BillingUnlockedFeatureList() {
  const t = useTranslations("pricing.plans.pro.features");
  const a = useTranslations("access");
  return (
    <section className="mt-5">
      <p className="text-sm font-semibold">{a("proFeaturesTitle")}</p>
      <ul className="mt-4 space-y-3">
        {PRO_UNLOCKED_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-(--foreground)">
              <HiCheck className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="leading-6">{t(feature)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
