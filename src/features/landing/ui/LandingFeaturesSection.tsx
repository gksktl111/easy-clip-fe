import type { IconType } from "react-icons";

interface LandingFeature {
  key: string;
  title: string;
  description: string;
  icon: IconType;
}

interface LandingFeaturesSectionProps {
  features: readonly LandingFeature[];
}

export function LandingFeaturesSection({
  features,
}: LandingFeaturesSectionProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            일의 흐름을 끊지 않는 클립보드
          </h2>
          <p className="mt-4 text-lg text-(--muted)">
            복사, 정리, 재사용까지 한 번에 관리하세요.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.key}
                className="rounded-2xl border border-(--border) bg-(--surface-muted) p-6 transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--landing-brand-bg)] text-[var(--landing-brand-fg)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
