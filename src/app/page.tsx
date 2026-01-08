"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HiOutlineClipboardCopy,
  HiOutlineFolder,
  HiOutlineLightningBolt,
  HiOutlineMoon,
  HiOutlineSearch,
  HiOutlineStar,
  HiOutlineSun,
} from "react-icons/hi";

// Features 섹션 데이터
const FEATURES = [
  {
    icon: HiOutlineLightningBolt,
    title: "즉시 동기화",
    description: "복사하는 순간 모든 기기에 실시간으로 반영됩니다.",
  },
  {
    icon: HiOutlineFolder,
    title: "폴더 정리",
    description: "프로젝트별로 클립을 묶어 체계적으로 관리하세요.",
  },
  {
    icon: HiOutlineStar,
    title: "즐겨찾기",
    description: "자주 쓰는 문구는 즐겨찾기로 빠르게 접근하세요.",
  },
  {
    icon: HiOutlineSearch,
    title: "빠른 검색",
    description: "키워드를 입력하면 즉시 원하는 클립을 찾아냅니다.",
  },
];

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크 모드 토글 핸들러
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <main
      className={`relative h-screen overflow-y-auto transition-colors duration-300 ${
        isDarkMode ? "bg-[#0f172a] text-[#f1f5f9]" : "bg-white text-[#1e293b]"
      }`}
    >
      {/* 헤더 */}
      <header
        className={`sticky top-0 z-20 border-b transition-colors duration-300 ${
          isDarkMode
            ? "border-white/10 bg-[#0f172a]/90"
            : "border-[#e2e8f0] bg-white/90"
        } backdrop-blur-md`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* 로고 */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isDarkMode ? "bg-[#334155]" : "bg-[#334155]"
              }`}
            >
              <HiOutlineClipboardCopy className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              EasyClip
            </span>
          </div>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-3">
            {/* 다크 모드 토글 */}
            <button
              onClick={handleToggleDarkMode}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                isDarkMode
                  ? "text-[#94a3b8] hover:bg-white/10 hover:text-white"
                  : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b]"
              }`}
              aria-label="다크 모드 전환"
            >
              {isDarkMode ? (
                <HiOutlineSun className="h-5 w-5" />
              ) : (
                <HiOutlineMoon className="h-5 w-5" />
              )}
            </button>

            {/* 시작하기 버튼 */}
            <Link
              href="/favorites"
              className="rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e293b]"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* 메인 헤딩 */}
          <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-6xl md:leading-tight">
            어디서든 복사하고.
            <br />
            어디서나 붙여넣기.
          </h1>

          {/* 서브 텍스트 */}
          <p
            className={`mt-6 max-w-2xl text-lg leading-relaxed ${
              isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"
            }`}
          >
            모든 기기에서 클립보드를 완벽하게 동기화하세요. 빠르게 움직이는
            개발자, 디자이너, 크리에이티브 팀을 위해 설계되었습니다.
          </p>

          {/* CTA 버튼들 */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/favorites"
              className="flex items-center gap-2 rounded-xl bg-[#334155] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e293b]"
            >
              무료로 시작하기
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/favorites"
              className={`flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors ${
                isDarkMode
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-[#e2e8f0] text-[#334155] hover:bg-[#f8fafc]"
              }`}
            >
              <span aria-hidden>▷</span>
              데모 보기
            </Link>
          </div>
        </div>

        {/* 디바이스 이미지 섹션 */}
        <div className="relative mt-20 flex items-center justify-center gap-6">
          {/* 노트북 이미지 */}
          <div
            className={`relative h-64 w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl md:h-80 ${
              isDarkMode
                ? "border-white/10 bg-[#1e293b]"
                : "border-[#e2e8f0] bg-[#f8fafc]"
            }`}
          >
            <div className="absolute inset-0 flex flex-col">
              {/* 창 상단 바 */}
              <div
                className={`flex items-center gap-2 border-b px-4 py-3 ${
                  isDarkMode ? "border-white/10" : "border-[#e2e8f0]"
                }`}
              >
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                  <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                </div>
                <span
                  className={`ml-4 text-xs ${
                    isDarkMode ? "text-[#64748b]" : "text-[#94a3b8]"
                  }`}
                >
                  Easy Clip - 클립보드 관리
                </span>
              </div>

              {/* 콘텐츠 영역 */}
              <div className="flex-1 p-4">
                <div className="space-y-3">
                  {["디자인 가이드라인", "API 엔드포인트", "회의 노트"].map(
                    (item, index) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 rounded-xl p-3 ${
                          isDarkMode ? "bg-white/5" : "bg-white"
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 동기화 아이콘 */}
          <div
            className={`absolute top-1/2 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg md:static md:translate-x-0 md:translate-y-0 ${
              isDarkMode ? "bg-[#334155]" : "bg-white"
            }`}
          >
            <svg
              className={`h-6 w-6 ${
                isDarkMode ? "text-white" : "text-[#334155]"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>

          {/* 모바일 이미지 */}
          <div
            className={`hidden h-72 w-40 overflow-hidden rounded-3xl border shadow-2xl md:block ${
              isDarkMode
                ? "border-white/10 bg-[#1e293b]"
                : "border-[#e2e8f0] bg-[#f8fafc]"
            }`}
          >
            <div className="flex h-full flex-col">
              {/* 상단 바 */}
              <div
                className={`flex items-center justify-center border-b py-2 ${
                  isDarkMode ? "border-white/10" : "border-[#e2e8f0]"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"
                  }`}
                >
                  Easy Clip
                </span>
              </div>

              {/* 콘텐츠 */}
              <div className="flex-1 p-3">
                <div className="space-y-2">
                  {["디자인 가이드", "API 엔드포인트"].map((item) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-lg p-2 ${
                        isDarkMode ? "bg-white/5" : "bg-white"
                      }`}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                      <span className="text-[10px] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features 섹션 */}
      <section
        className={`py-24 ${isDarkMode ? "bg-[#1e293b]/50" : "bg-[#f8fafc]"}`}
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* 섹션 헤더 */}
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              필요한 모든 것.
              <br />
              불필요한 것은 없이.
            </h2>
            <p
              className={`mt-4 text-base ${
                isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"
              }`}
            >
              방해하지 않는 강력한 기능. 복사하고, 붙여넣고, 계속 진행하세요.
            </p>
          </div>

          {/* 기능 그리드 */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isDarkMode
                      ? "border-white/10 bg-[#1e293b] hover:border-white/20"
                      : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
                  }`}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                      isDarkMode ? "bg-white/10" : "bg-[#f1f5f9]"
                    }`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${
                        isDarkMode ? "text-[#38bdf8]" : "text-[#334155]"
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 워크플로우 섹션 */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* 섹션 헤더 */}
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              당신의 작업 방식에 맞게
            </h2>
            <p
              className={`mx-auto mt-4 max-w-2xl text-base leading-relaxed ${
                isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"
              }`}
            >
              코드를 작성하든, 인터페이스를 디자인하든, 콘텐츠를
              제작하든—EasyClip은 당신의 워크플로우에 적응합니다.
            </p>
          </div>

          {/* 코드 에디터 목업 */}
          <div
            className={`mt-16 overflow-hidden rounded-3xl border shadow-2xl ${
              isDarkMode
                ? "border-white/10 bg-[#0f172a]"
                : "border-[#e2e8f0] bg-[#1e293b]"
            }`}
          >
            {/* 에디터 상단 바 */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
              </div>
              <span className="ml-4 text-xs text-[#64748b]">
                editor.tsx — EasyClip
              </span>
            </div>

            {/* 코드 콘텐츠 */}
            <div className="p-6 font-mono text-sm">
              <div className="space-y-1 text-[#94a3b8]">
                <p>
                  <span className="text-[#c084fc]">import</span>{" "}
                  <span className="text-[#fbbf24]">{"{ useClipboard }"}</span>{" "}
                  <span className="text-[#c084fc]">from</span>{" "}
                  <span className="text-[#34d399]">&apos;easy-clip&apos;</span>;
                </p>
                <p className="text-[#475569]">{"// 클립보드 훅 초기화"}</p>
                <p>
                  <span className="text-[#c084fc]">const</span> clipboard ={" "}
                  <span className="text-[#38bdf8]">useClipboard</span>();
                </p>
                <p className="mt-4">
                  <span className="text-[#475569]">
                    {"// 어디서든 복사하고, 어디서나 붙여넣기"}
                  </span>
                </p>
                <p>
                  clipboard.<span className="text-[#38bdf8]">copy</span>(
                  <span className="text-[#34d399]">
                    &apos;Hello, World!&apos;
                  </span>
                  );
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center">
            <Link
              href="/favorites"
              className="rounded-2xl bg-[#334155] px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-[#1e293b] hover:shadow-xl"
            >
              무료로 동기화 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer
        className={`border-t py-12 ${
          isDarkMode
            ? "border-white/10 bg-[#0f172a]"
            : "border-[#e2e8f0] bg-white"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* 로고 및 설명 */}
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#334155]">
                  <HiOutlineClipboardCopy className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  EasyClip
                </span>
              </div>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  isDarkMode ? "text-[#94a3b8]" : "text-[#64748b]"
                }`}
              >
                모든 기기에서 완벽한 클립보드 동기화. 어디서든 복사하고,
                어디서나 붙여넣으세요.
              </p>
            </div>

            {/* 링크들 */}
            <div className="flex flex-wrap gap-8">
              <a
                href="#"
                className={`text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#94a3b8] hover:text-white"
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                개인정보 처리방침
              </a>
              <a
                href="#"
                className={`text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#94a3b8] hover:text-white"
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                이용약관
              </a>
              <a
                href="#"
                className={`text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#94a3b8] hover:text-white"
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                문의하기
              </a>
              <a
                href="#"
                className={`text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#94a3b8] hover:text-white"
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                문서
              </a>
            </div>
          </div>

          {/* 저작권 */}
          <div
            className={`mt-12 border-t pt-8 text-center text-sm ${
              isDarkMode
                ? "border-white/10 text-[#64748b]"
                : "border-[#e2e8f0] text-[#94a3b8]"
            }`}
          >
            © 2026 EasyClip. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
