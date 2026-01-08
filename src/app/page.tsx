import Link from "next/link";
import {
  HiOutlineFolder,
  HiOutlineSearch,
  HiOutlineStar,
  HiOutlineTag,
} from "react-icons/hi";

// Features 섹션 아이콘 매핑
const FEATURE_ICONS = [
  HiOutlineTag,
  HiOutlineStar,
  HiOutlineFolder,
  HiOutlineSearch,
];

export default function Home() {
  const features = [
    {
      title: "한 번에 정리되는 클립",
      description:
        "복사한 내용을 자동 분류하고 태그로 찾을 수 있어요. 클릭 몇 번이면 끝.",
    },
    {
      title: "자주 쓰는 문구 즐겨찾기",
      description:
        "반복해서 쓰는 문구는 고정해두고, 필요한 순간에 바로 가져가세요.",
    },
    {
      title: "폴더로 흐름 유지",
      description:
        "프로젝트별로 폴더를 묶어두면, 헤매지 않고 바로 이어서 작업합니다.",
    },
    {
      title: "검색은 즉시 반응",
      description: "키워드를 입력하는 순간 결과가 갱신됩니다.",
    },
  ];

  const steps = [
    {
      title: "설치 없이 시작",
      description: "브라우저에서 바로 열고 로그인만 하면 준비 완료.",
    },
    {
      title: "복사하면 자동 저장",
      description: "클립보드에 복사한 내용이 즉시 목록에 쌓입니다.",
    },
    {
      title: "필요할 때 바로 사용",
      description: "즐겨찾기와 최근 사용으로 가장 빠른 길을 제공합니다.",
    },
  ];

  const faqs = [
    {
      question: "무료로 사용할 수 있나요?",
      answer: "기본 기능은 무료로 제공됩니다.",
    },
    {
      question: "데이터는 어디에 저장되나요?",
      answer: "브라우저와 계정에 안전하게 저장됩니다.",
    },
    {
      question: "팀과도 공유할 수 있나요?",
      answer: "팀 공유 기능은 곧 업데이트될 예정입니다.",
    },
    {
      question: "모바일에서도 사용할 수 있나요?",
      answer: "모바일 웹에서 최적화된 경험을 제공합니다.",
    },
  ];

  const stats = [
    { label: "저장된 클립", value: "120K+" },
    { label: "평균 복구 시간", value: "1.4초" },
    { label: "활성 사용자", value: "8.2K" },
  ];

  const brandLabels = ["DesignOps", "Fastlane", "Clipline", "Studio Q"];

  return (
    <main className="relative h-screen overflow-y-auto bg-[#f7f1e7] text-[#1a1a1a]">
      {/* 배경 그라데이션 효과 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-80 w-80 rounded-full bg-[#f97316]/15 blur-[100px]" />
        <div className="absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-[#0ea5e9]/15 blur-[100px]" />
        <div className="absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-[#22c55e]/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#a855f7]/10 blur-[100px]" />
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f7f1e7]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-lg font-semibold">
            <span className="rounded-full bg-[#111827] px-3 py-1 text-xs font-bold tracking-[0.25em] text-[#f8fafc] uppercase">
              easy
            </span>
            <span className="tracking-tight">Clipboard Studio</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#features"
              className="text-[#4b5563] transition hover:text-[#0f766e]"
            >
              기능
            </a>
            <a
              href="#flow"
              className="text-[#4b5563] transition hover:text-[#0f766e]"
            >
              사용 흐름
            </a>
            <a
              href="#trust"
              className="text-[#4b5563] transition hover:text-[#0f766e]"
            >
              신뢰
            </a>
            <a
              href="#faq"
              className="text-[#4b5563] transition hover:text-[#0f766e]"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/favorites"
              className="hidden rounded-full border border-[#1f2937]/80 px-4 py-2 text-sm font-semibold transition hover:bg-[#1f2937] hover:text-[#f8fafc] sm:block"
            >
              데모 보기
            </Link>
            <Link
              href="/favorites"
              className="rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-[#f8fafc] shadow-lg shadow-[#0f766e]/25 transition hover:bg-[#115e59] hover:shadow-xl hover:shadow-[#0f766e]/30"
            >
              지금 시작
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7 motion-safe:animate-[fade-up_0.8s_ease-out_both]">
            <p className="text-xs font-bold tracking-[0.4em] text-[#9a3412] uppercase">
              Simple & Easy
            </p>
            <h1 className="text-4xl leading-[1.15] font-bold tracking-tight md:text-5xl">
              이지클립의 핵심은
              <span className="mt-1 block bg-linear-to-r from-[#0f766e] to-[#0ea5e9] bg-clip-text text-transparent">
                간단하고 쉬운 사용
              </span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-[#4b5563] md:text-lg">
              복사한 순간부터 정리까지, 흐름을 끊지 않는 클립보드 경험을
              제공합니다. 복잡한 설정 없이 지금 바로 시작하세요.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/favorites"
                className="rounded-full border border-black/15 bg-white/50 px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:border-black/30 hover:bg-white/80"
              >
                무료로 시작하기
              </Link>
              <a
                href="#preview"
                className="rounded-full border border-black/15 bg-white/50 px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:border-black/30 hover:bg-white/80"
              >
                제품 미리보기
              </a>
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-[#6b7280]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                설정 X
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                자동 저장
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                쉬운 검색
              </span>
            </div>
          </div>

          {/* 프리뷰 카드 */}
          <div
            id="preview"
            className="relative rounded-3xl border border-black/5 bg-white/80 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm motion-safe:animate-[float_8s_ease-in-out_infinite]"
          >
            <div className="absolute top-8 -left-6 hidden h-24 w-24 rounded-3xl bg-linear-to-br from-[#0f766e] to-[#0d9488] text-[#f8fafc] shadow-xl shadow-[#0f766e]/30 md:flex md:flex-col md:items-center md:justify-center md:gap-1 md:text-xs">
              <span className="text-2xl font-bold">3s</span>
              <span className="text-center text-[10px] leading-tight opacity-90">
                최근 클립
                <br />
                찾기
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#111827]">
                오늘의 클립
              </span>
              <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#b45309]">
                자동 분류
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                "디자인 제안서 v2 문구 정리",
                "프로덕트 업데이트 릴리즈 노트",
                "고객 응대 답변 템플릿",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-[#e5e7eb]/80 bg-[#fafafa]/80 p-3 transition hover:border-[#0f766e]/30 hover:bg-white"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-[#0f766e]" />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {item}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      방금 복사됨 · 즐겨찾기 가능
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {["브랜드 메시지", "세일즈 스크립트"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#e5e7eb]/80 bg-white p-4 text-sm font-semibold text-[#111827] shadow-sm transition hover:shadow-md"
                >
                  {item}
                  <span className="mt-2 block text-xs font-medium text-[#6b7280]">
                    자주 쓰는 문구
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features 섹션 */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#0f766e] uppercase">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              해야 할 일은 줄이고, 필요한 순간을 앞당깁니다.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#6b7280]">
            이지클립은 복사된 정보를 자동으로 정리하고 필요한 정보를 빠르게
            찾도록 설계되었습니다.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const IconComponent = FEATURE_ICONS[index];
            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-black/5 bg-white/70 p-7 shadow-lg shadow-black/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/10"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#0f766e]/10 to-[#0ea5e9]/10 text-[#0f766e] transition duration-300 group-hover:scale-110 group-hover:from-[#0f766e] group-hover:to-[#0d9488] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#0f766e]/25">
                  <IconComponent className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flow 섹션 */}
      <section id="flow" className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-linear-to-br from-[#111827] to-[#1f2937] px-8 py-14 text-[#f8fafc] shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-[#38bdf8] uppercase">
                Flow
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                세 단계면 충분합니다.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#94a3b8]">
              복잡한 설정 없이 로그인하고 복사만 하면 자동으로 정리됩니다.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-3xl font-bold text-[#38bdf8]">
                  0{index + 1}
                </p>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust 섹션 */}
      <section id="trust" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1fr]">
          <div className="space-y-6">
            <p className="text-xs font-bold tracking-[0.3em] text-[#ea580c] uppercase">
              Trust
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              팀의 시간을 지키는 작은 습관
            </h2>
            <p className="text-sm leading-relaxed text-[#6b7280]">
              클립보드를 다시 찾는 시간을 줄이면 집중할 시간이 늘어납니다.
            </p>
            <div className="grid gap-4 pt-2">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-black/5 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-2xl font-bold text-[#111827]">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-[#6b7280]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/5 bg-white/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
            <p className="text-sm font-bold text-[#111827]">
              크리에이터와 팀이 함께 선택한 이유
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {brandLabels.map((brand) => (
                <div
                  key={brand}
                  className="flex items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white/80 px-4 py-6 text-sm font-semibold text-[#6b7280] transition hover:border-[#0f766e]/30 hover:text-[#0f766e]"
                >
                  {brand}
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-linear-to-br from-[#0f766e]/10 to-[#0ea5e9]/5 p-6 text-sm leading-relaxed text-[#115e59]">
              &ldquo;하루에 수십 번 복사한 내용을 찾느라 낭비하던 시간이
              사라졌어요. 이지클립은 정말 간단하고 쉬워요.&rdquo;
              <span className="mt-4 block text-xs font-bold text-[#0f766e]">
                — Studio Q 리드 디자이너
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section id="faq" className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#0f766e] uppercase">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              자주 묻는 질문
            </h2>
          </div>
          <Link
            href="/favorites"
            className="w-fit rounded-full border border-black/15 bg-white/50 px-6 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:border-black/30 hover:bg-white"
          >
            바로 시작하기
          </Link>
        </div>
        <div className="mt-10 grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-black/5 bg-white/80 px-6 py-5 backdrop-blur-sm transition hover:shadow-md"
            >
              <p className="text-sm font-bold text-[#111827]">{faq.question}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-linear-to-br from-[#111827] to-[#1f2937] px-8 py-14 text-[#f8fafc] shadow-2xl shadow-black/30">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-[#38bdf8] uppercase">
                Ready
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                지금 바로 쉽고 간단한 클립 흐름을 시작하세요.
              </h2>
            </div>
            <Link
              href="/favorites"
              className="rounded-full bg-[#38bdf8] px-7 py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#38bdf8]/30 transition hover:bg-[#0ea5e9] hover:shadow-xl hover:shadow-[#38bdf8]/40"
            >
              로그인하고 시작
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-black/5 bg-[#f7f1e7]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#111827]">Easy Clip</p>
            <p className="mt-2 text-xs text-[#6b7280]">
              간단하고 쉬운 사용을 가장 중요하게 생각합니다.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#6b7280]">
            <span>© 2025 Easy Clip</span>
            <a href="#" className="transition hover:text-[#111827]">
              Privacy
            </a>
            <a href="#" className="transition hover:text-[#111827]">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
