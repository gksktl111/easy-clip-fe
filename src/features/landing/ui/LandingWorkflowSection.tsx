// 클립 저장부터 재사용까지의 제품 흐름을 단계별 카드로 설명합니다.
interface LandingWorkflowStep {
  step: string;
  title: string;
  description: string;
}

interface LandingWorkflowSectionProps {
  title: string;
  description: string;
  steps: readonly LandingWorkflowStep[];
}

function LandingWorkflowStepCard({
  index,
  step,
}: {
  index: number;
  step: LandingWorkflowStep;
}) {
  return (
    <li className="border-t border-(--border) py-6">
      <span className="text-sm font-medium text-(--muted)">{index + 1}</span>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight break-keep-ko">
        {step.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-(--muted) md:text-base">
        {step.description}
      </p>
    </li>
  );
}

export function LandingWorkflowSection({
  title,
  description,
  steps,
}: LandingWorkflowSectionProps) {
  return (
    <section className="border-t border-(--border) bg-(--surface) py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance break-keep-ko md:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-base leading-7 text-(--muted) md:text-lg">
            {description}
          </p>
        </div>

        <ol className="mt-14 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <LandingWorkflowStepCard
              key={step.step}
              index={index}
              step={step}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
