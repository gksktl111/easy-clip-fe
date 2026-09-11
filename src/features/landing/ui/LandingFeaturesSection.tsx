import type { IconType } from "react-icons";

// 랜딩 페이지에서 제품의 핵심 기능을 반복 가능한 카드 목록으로 소개합니다.
interface LandingFeature {
  key: string;
  title: string;
  description: string;
  icon: IconType;
}

interface LandingFeaturesSectionProps {
  title: string;
  description: string;
  features: readonly LandingFeature[];
}

function LandingFeatureCard({ feature }: { feature: LandingFeature }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-2xl border border-(--border) bg-(--surface-muted) p-6">
      <div className="mb-5 flex h-8 w-8 items-center justify-center text-(--foreground)">
        <Icon className="h-6 w-6 shrink-0" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        {feature.description}
      </p>
    </article>
  );
}

export function LandingFeaturesSection({
  title,
  description,
  features,
}: LandingFeaturesSectionProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance break-keep-ko md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-(--muted)">{description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <LandingFeatureCard key={feature.key} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
