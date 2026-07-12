import { HiOutlineSparkles } from "react-icons/hi";

// 요금제 페이지의 목적과 선택 안내를 첫 영역에 표시합니다.
export function PricingHeroSection() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-(--muted) backdrop-blur-sm"
        style={{
          backgroundColor: "var(--pricing-chip-bg)",
          border: "1px solid var(--pricing-chip-border)",
        }}
      >
        <HiOutlineSparkles className="h-4 w-4" aria-hidden />
        <span>Simple plans for focused users</span>
      </div>

      <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
        작업 방식에 맞는
        <br />
        EasyClip 플랜을 선택하세요.
      </h1>
    </div>
  );
}
