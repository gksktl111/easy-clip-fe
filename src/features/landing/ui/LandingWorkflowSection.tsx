// 클립 저장부터 재사용까지의 제품 흐름을 단계별 카드로 설명합니다.
interface LandingWorkflowStep {
  step: string;
  title: string;
  description: string;
}

interface LandingWorkflowSectionProps {
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
    <article className="relative overflow-hidden rounded-[2rem] border border-(--border) bg-(--background) p-7">
      <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-(--surface-muted) blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-(--surface-muted) px-3 py-1 text-xs font-semibold tracking-[0.16em] text-(--muted) uppercase">
            {step.step}
          </span>
          <span className="text-4xl font-semibold tracking-tight text-(--border)">
            0{index + 1}
          </span>
        </div>

        <h3 className="mt-10 text-2xl font-semibold tracking-tight">
          {step.title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-(--muted) md:text-base">
          {step.description}
        </p>
      </div>
    </article>
  );
}

export function LandingWorkflowSection({ steps }: LandingWorkflowSectionProps) {
  return (
    <section className="border-t border-(--border) bg-(--surface) py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            복사한 순간부터 다시 쓰는 순간까지
          </h2>
          <p className="mt-5 text-base leading-7 text-(--muted) md:text-lg">
            저장, 분류, 재사용이 하나의 흐름으로 이어지도록 설계했습니다. 복붙을
            임시 행동이 아니라 반복 가능한 작업 시스템으로 바꿉니다.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <LandingWorkflowStepCard
              key={step.step}
              index={index}
              step={step}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
