import { HiCheck } from "react-icons/hi";

const PRO_UNLOCKED_FEATURES = [
  "무제한 프로젝트 생성",
  "프로젝트당 최대 500개 클립 저장",
  "무제한 기기 연동",
  "태그 기반 클립 정리",
  "AI 기능 우선 제공 예정",
] as const;

export function BillingUnlockedFeatureList() {
  return (
    <div className="mt-5 rounded-xl border border-(--border) bg-(--surface-muted) p-4">
      <p className="text-sm font-semibold">Pro 구독 시 해금되는 기능</p>
      <ul className="mt-4 space-y-3">
        {PRO_UNLOCKED_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary) text-(--primary-foreground)">
              <HiCheck className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="leading-6">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
