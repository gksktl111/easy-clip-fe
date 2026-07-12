"use client";

import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

type TokenKind = "color" | "gradient" | "shadow";
type ThemeName = "light" | "dark";

interface PrimitiveToken {
  name: string;
  value: string;
  description: string;
  kind?: TokenKind;
}

interface ThemeToken {
  name: string;
  role: string;
  description: string;
  kind?: TokenKind;
}

interface TokenGroup<TToken> {
  title: string;
  description: string;
  tokens: TToken[];
}

const primitiveGroups: TokenGroup<PrimitiveToken>[] = [
  {
    title: "Neutral",
    description: "배경, 표면, 텍스트, 경계에 반복 사용되는 무채색 계열입니다.",
    tokens: [
      {
        name: "white",
        value: "#ffffff",
        description: "밝은 표면과 강조 배경",
      },
      {
        name: "slate-50",
        value: "#f8fafc",
        description: "밝은 페이지 배경과 입력 배경",
      },
      {
        name: "slate-100",
        value: "#f1f5f9",
        description: "약한 표면과 hover 배경",
      },
      {
        name: "slate-200",
        value: "#e2e8f0",
        description: "밝은 테마 경계와 구분 배경",
      },
      {
        name: "slate-400",
        value: "#94a3b8",
        description: "비활성 아이콘과 보조 요소",
      },
      {
        name: "slate-500",
        value: "#64748b",
        description: "밝은 테마 보조 텍스트",
      },
      {
        name: "slate-700",
        value: "#334155",
        description: "랜딩 강조 배경과 floating 텍스트",
      },
      {
        name: "slate-900",
        value: "#0f172a",
        description: "밝은 테마 주요 텍스트와 강한 강조",
      },
      {
        name: "gray-100",
        value: "#f3f4f6",
        description: "어두운 테마 주요 텍스트",
      },
      {
        name: "gray-200",
        value: "#e5e7eb",
        description: "아이콘 chip 배경과 modal icon 텍스트",
      },
      {
        name: "gray-400",
        value: "#9ca3af",
        description: "어두운 테마 보조 텍스트와 포커스 링",
      },
      {
        name: "gray-600",
        value: "#4b5563",
        description: "밝은 테마 modal icon 텍스트",
      },
      {
        name: "gray-800",
        value: "#1f2937",
        description: "밝은 테마 primary hover",
      },
      {
        name: "gray-900",
        value: "#111827",
        description: "밝은 테마 primary와 chip 배경",
      },
      {
        name: "dark-900",
        value: "#1e1e1f",
        description: "어두운 테마 기본 표면",
      },
      {
        name: "dark-800",
        value: "#242426",
        description: "어두운 테마 elevated surface",
      },
      {
        name: "dark-700",
        value: "#2a2a2b",
        description: "어두운 테마 muted surface와 input",
      },
      {
        name: "dark-page",
        value: "#353535",
        description: "어두운 테마 페이지 배경",
      },
      {
        name: "black",
        value: "#000000",
        description: "강한 overlay와 shadow 기반 색상",
      },
    ],
  },
  {
    title: "Brand / State",
    description: "브랜드 액션, 피드백 상태, 요금제 강조에 사용하는 유채색 계열입니다.",
    tokens: [
      {
        name: "indigo-400",
        value: "#818cf8",
        description: "어두운 테마 요금제 버튼 hover",
      },
      {
        name: "indigo-500",
        value: "#6366f1",
        description: "어두운 테마 primary hover와 pricing button",
      },
      {
        name: "indigo-600",
        value: "#4f46e5",
        description: "어두운 테마 primary와 요금제 accent",
      },
      {
        name: "indigo-700",
        value: "#4338ca",
        description: "어두운 테마 featured gradient",
      },
      {
        name: "indigo-900",
        value: "#312e81",
        description: "밝은 테마 featured gradient",
      },
      {
        name: "indigo-200",
        value: "#c7d2fe",
        description: "featured plan 보조 텍스트",
      },
      {
        name: "indigo-300",
        value: "#a5b4fc",
        description: "어두운 테마 pricing accent",
      },
      {
        name: "red-400",
        value: "#f87171",
        description: "어두운 테마 danger surface alpha 기반",
      },
      {
        name: "red-500",
        value: "#ef4444",
        description: "danger 액션",
      },
      {
        name: "red-600",
        value: "#dc2626",
        description: "danger hover",
      },
      {
        name: "red-700",
        value: "#b91c1c",
        description: "밝은 테마 danger text",
      },
      {
        name: "red-100",
        value: "#fee2e2",
        description: "밝은 테마 danger 계열 보조 색",
      },
      {
        name: "red-50",
        value: "#fef2f2",
        description: "밝은 테마 danger surface",
      },
      {
        name: "red-200",
        value: "#fecaca",
        description: "danger border와 dark danger text",
      },
      {
        name: "green-400",
        value: "#4ade80",
        description: "어두운 테마 success",
      },
      {
        name: "green-500",
        value: "#22c55e",
        description: "밝은 테마 success",
      },
      {
        name: "amber-400",
        value: "#fbbf24",
        description: "어두운 테마 warning",
      },
      {
        name: "amber-500",
        value: "#f59e0b",
        description: "밝은 테마 warning",
      },
    ],
  },
  {
    title: "Alpha / Effect",
    description: "투명 배경, 오버레이, 그림자, gradient에 사용하는 effect 값입니다.",
    tokens: [
      {
        name: "overlay-slate",
        value: "rgba(15, 23, 42, 0.4)",
        description: "밝은 테마 기본 overlay",
      },
      {
        name: "overlay-black",
        value: "rgba(0, 0, 0, 0.4)",
        description: "어두운 테마 기본 overlay",
      },
      {
        name: "overlay-strong",
        value: "rgba(0, 0, 0, 0.7)",
        description: "강한 모달 overlay",
      },
      {
        name: "white-alpha-88",
        value: "rgba(255, 255, 255, 0.88)",
        description: "밝은 테마 floating button 배경",
      },
      {
        name: "dark-alpha-88",
        value: "rgba(30, 30, 31, 0.88)",
        description: "어두운 테마 floating button 배경",
      },
      {
        name: "featured-light-gradient",
        value: "linear-gradient(145deg, #111827, #312e81)",
        description: "밝은 테마 Pro 카드 배경",
        kind: "gradient",
      },
      {
        name: "featured-dark-gradient",
        value: "linear-gradient(145deg, #111827, #4338ca)",
        description: "어두운 테마 Pro 카드 배경",
        kind: "gradient",
      },
      {
        name: "surface-shadow-light",
        value: "0 24px 80px rgba(15, 23, 42, 0.12)",
        description: "밝은 테마 카드 elevation",
        kind: "shadow",
      },
      {
        name: "surface-shadow-dark",
        value: "0 24px 80px rgba(0, 0, 0, 0.28)",
        description: "어두운 테마 카드 elevation",
        kind: "shadow",
      },
    ],
  },
];

const themeTokenGroups: TokenGroup<ThemeToken>[] = [
  {
    title: "Core / Semantic",
    description: "앱 전반의 배경, 표면, 텍스트, 경계에 사용하는 기본 의미 토큰입니다.",
    tokens: [
      {
        name: "--background",
        role: "Page background",
        description: "페이지 최상위 배경색",
      },
      {
        name: "--foreground",
        role: "Primary text",
        description: "기본 본문과 제목 텍스트",
      },
      {
        name: "--surface",
        role: "Default surface",
        description: "카드, 섹션, 메뉴의 기본 표면",
      },
      {
        name: "--surface-muted",
        role: "Muted surface",
        description: "약한 구분 배경과 hover 배경",
      },
      {
        name: "--surface-elevated",
        role: "Elevated surface",
        description: "모달, 드롭다운처럼 떠 있는 표면",
      },
      {
        name: "--border",
        role: "Default border",
        description: "기본 구분선과 컨트롤 경계",
      },
      {
        name: "--muted",
        role: "Secondary text",
        description: "보조 설명, 메타 정보, 비강조 아이콘",
      },
      {
        name: "--input",
        role: "Input background",
        description: "텍스트 입력 필드 배경",
      },
    ],
  },
  {
    title: "Action / State",
    description: "주요 액션, 피드백 상태, 포커스와 오버레이에 사용하는 토큰입니다.",
    tokens: [
      {
        name: "--primary",
        role: "Primary action",
        description: "주요 버튼과 활성 상태",
      },
      {
        name: "--primary-hover",
        role: "Primary action hover",
        description: "주요 액션 hover 배경",
      },
      {
        name: "--primary-foreground",
        role: "On primary text",
        description: "primary 위에 올라가는 텍스트",
      },
      {
        name: "--danger",
        role: "Danger action",
        description: "삭제, 오류 등 위험 액션",
      },
      {
        name: "--danger-hover",
        role: "Danger action hover",
        description: "위험 액션 hover 배경",
      },
      {
        name: "--danger-foreground",
        role: "On danger text",
        description: "danger 위에 올라가는 텍스트",
      },
      {
        name: "--danger-surface",
        role: "Danger surface",
        description: "오류 안내 박스 배경",
      },
      {
        name: "--danger-border",
        role: "Danger border",
        description: "오류 안내와 선택 삭제 경계",
      },
      {
        name: "--danger-text",
        role: "Danger text",
        description: "오류 안내 텍스트",
      },
      {
        name: "--success",
        role: "Success status",
        description: "성공 토스트와 완료 상태",
      },
      {
        name: "--warning",
        role: "Warning status",
        description: "즐겨찾기 별 아이콘 등 주의/강조 상태",
      },
      {
        name: "--focus-ring",
        role: "Focus indicator",
        description: "키보드 포커스 링과 드롭 위치 표시",
      },
      {
        name: "--overlay",
        role: "Overlay",
        description: "기본 모달/모바일 오버레이",
      },
      {
        name: "--overlay-strong",
        role: "Strong overlay",
        description: "강한 주목이 필요한 모달 오버레이",
      },
    ],
  },
  {
    title: "Shared Components",
    description: "공용 UI와 앱 내부 컴포넌트에서 반복 사용되는 컴포넌트 단위 토큰입니다.",
    tokens: [
      {
        name: "--chip-bg",
        role: "Floating chip background",
        description: "클립 복사 토스트 등 떠 있는 chip 배경",
      },
      {
        name: "--chip-text",
        role: "Floating chip text",
        description: "chip 위에 올라가는 텍스트",
      },
      {
        name: "--icon-chip",
        role: "Icon chip background",
        description: "아이콘을 담는 작은 배경",
      },
      {
        name: "--icon-chip-text",
        role: "Icon chip foreground",
        description: "아이콘 chip 안의 아이콘/텍스트",
      },
      {
        name: "--favorite-btn-bg",
        role: "Favorite button background",
        description: "클립 카드 즐겨찾기 버튼 기본 배경",
      },
      {
        name: "--favorite-btn-bg-hover",
        role: "Favorite button hover",
        description: "클립 카드 즐겨찾기 버튼 hover 배경",
      },
      {
        name: "--favorite-btn-shadow",
        role: "Favorite button shadow",
        description: "클립 카드 즐겨찾기 버튼 그림자",
        kind: "shadow",
      },
      {
        name: "--favorite-icon-muted",
        role: "Favorite icon muted",
        description: "비활성 즐겨찾기 아이콘",
      },
      {
        name: "--clip-scrollbar-track",
        role: "Scrollbar track",
        description: "클립 목록 스크롤바 트랙",
      },
      {
        name: "--clip-scrollbar-thumb",
        role: "Scrollbar thumb",
        description: "클립 목록 스크롤바 thumb",
      },
      {
        name: "--clip-scrollbar-thumb-hover",
        role: "Scrollbar thumb hover",
        description: "클립 목록 스크롤바 thumb hover",
      },
      {
        name: "--modal-section-bg",
        role: "Modal section background",
        description: "설정 모달 내부 섹션 배경",
      },
      {
        name: "--modal-icon-bg",
        role: "Modal icon background",
        description: "모달 내부 아이콘 배경",
      },
      {
        name: "--modal-icon-fg",
        role: "Modal icon foreground",
        description: "모달 내부 아이콘 색상",
      },
      {
        name: "--dropdown-option-hover",
        role: "Dropdown option hover",
        description: "드롭다운 옵션 hover/selected 배경",
      },
    ],
  },
  {
    title: "Landing",
    description: "랜딩 페이지와 마케팅 섹션에서 사용하는 브랜드/데모 전용 토큰입니다.",
    tokens: [
      {
        name: "--landing-header-bg",
        role: "Landing header background",
        description: "랜딩 상단 sticky header 배경",
      },
      {
        name: "--landing-brand-bg",
        role: "Landing brand background",
        description: "랜딩 CTA와 브랜드 블록 배경",
      },
      {
        name: "--landing-brand-fg",
        role: "Landing brand foreground",
        description: "브랜드 배경 위 텍스트/아이콘",
      },
      {
        name: "--landing-brand-muted",
        role: "Landing brand muted text",
        description: "브랜드 배경 위 보조 텍스트",
      },
      {
        name: "--landing-brand-soft",
        role: "Landing brand soft text",
        description: "브랜드 배경 위 긴 설명 텍스트",
      },
      {
        name: "--landing-demo-surface",
        role: "Landing demo surface",
        description: "랜딩 데모 UI 외부 표면",
      },
      {
        name: "--landing-demo-card",
        role: "Landing demo card",
        description: "랜딩 데모 UI 내부 카드",
      },
      {
        name: "--landing-float-bg",
        role: "Landing floating background",
        description: "랜딩 floating 요소 배경",
      },
      {
        name: "--landing-float-fg",
        role: "Landing floating foreground",
        description: "랜딩 floating 요소 텍스트",
      },
      {
        name: "--landing-shadow",
        role: "Landing elevation",
        description: "랜딩 데모/브랜드 요소 그림자",
        kind: "shadow",
      },
    ],
  },
  {
    title: "Pricing",
    description: "요금제 페이지의 카드, 비교표, featured plan 표현에 사용하는 토큰입니다.",
    tokens: [
      {
        name: "--pricing-chip-bg",
        role: "Pricing chip background",
        description: "요금제 hero chip 배경",
      },
      {
        name: "--pricing-chip-border",
        role: "Pricing chip border",
        description: "요금제 hero chip 경계",
      },
      {
        name: "--pricing-accent",
        role: "Pricing accent",
        description: "요금제 비교표 Pro 강조 색상",
      },
      {
        name: "--pricing-featured-bg",
        role: "Featured plan background",
        description: "Pro 카드 배경 gradient",
        kind: "gradient",
      },
      {
        name: "--pricing-featured-muted",
        role: "Featured muted text",
        description: "Pro 카드 상단 보조 텍스트",
      },
      {
        name: "--pricing-featured-text",
        role: "Featured body text",
        description: "Pro 카드 설명 텍스트",
      },
      {
        name: "--pricing-featured-badge",
        role: "Featured badge background",
        description: "Pro 카드 추천 badge 배경",
      },
      {
        name: "--pricing-check-bg",
        role: "Pricing check background",
        description: "요금제 feature check icon 배경",
      },
      {
        name: "--pricing-check-fg",
        role: "Pricing check foreground",
        description: "요금제 feature check icon",
      },
      {
        name: "--pricing-button-bg",
        role: "Pricing button background",
        description: "기본 요금제 CTA 배경",
      },
      {
        name: "--pricing-button-bg-hover",
        role: "Pricing button hover",
        description: "기본 요금제 CTA hover 배경",
      },
      {
        name: "--pricing-button-fg",
        role: "Pricing button text",
        description: "기본 요금제 CTA 텍스트",
      },
      {
        name: "--pricing-button-featured-bg",
        role: "Featured button background",
        description: "Pro 요금제 CTA 배경",
      },
      {
        name: "--pricing-button-featured-bg-hover",
        role: "Featured button hover",
        description: "Pro 요금제 CTA hover 배경",
      },
      {
        name: "--pricing-button-featured-fg",
        role: "Featured button text",
        description: "Pro 요금제 CTA 텍스트",
      },
      {
        name: "--pricing-hero-glow",
        role: "Pricing hero glow",
        description: "요금제 페이지 배경 glow gradient",
        kind: "gradient",
      },
      {
        name: "--pricing-hero-fade",
        role: "Pricing hero fade",
        description: "요금제 페이지 배경 fade gradient",
        kind: "gradient",
      },
      {
        name: "--pricing-card-shadow",
        role: "Pricing card elevation",
        description: "요금제 카드 그림자",
        kind: "shadow",
      },
      {
        name: "--pricing-compare-shadow",
        role: "Pricing compare elevation",
        description: "요금제 비교표 그림자",
        kind: "shadow",
      },
    ],
  },
];

const meta = {
  title: "Shared UI/Color Tokens",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "globals.css에서 사용하는 색상 값을 primitive로 먼저 정리하고, 이후 semantic token이 light/dark theme에서 어떤 값으로 해석되는지 비교하는 문서입니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function TokenPreview({
  kind = "color",
  styleValue,
}: {
  kind?: TokenKind;
  styleValue: string;
}) {
  const previewStyle =
    kind === "shadow"
      ? {
          boxShadow: styleValue,
        }
      : {
          background: styleValue,
        };

  return (
    <div
      className="h-20 border-b border-(--border) bg-(--surface-muted)"
      style={previewStyle}
      aria-hidden
    />
  );
}

function PrimitiveSwatch({ token }: { token: PrimitiveToken }) {
  const kind = token.kind ?? "color";

  return (
    <article className="overflow-hidden rounded-xl border border-(--border) bg-(--surface) shadow-sm">
      <TokenPreview kind={kind} styleValue={token.value} />
      <div className="space-y-2 p-4">
        <div>
          <p className="text-sm font-semibold text-(--foreground)">
            {token.name}
          </p>
          <p className="mt-1 break-words font-mono text-xs text-(--muted)">
            {token.value}
          </p>
        </div>
        <p className="text-xs leading-5 text-(--muted)">
          {token.description}
        </p>
      </div>
    </article>
  );
}

function ThemeTokenSwatch({
  token,
  theme,
}: {
  token: ThemeToken;
  theme: ThemeName;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [resolvedValue, setResolvedValue] = useState("");
  const kind = token.kind ?? "color";

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    setResolvedValue(
      getComputedStyle(rootRef.current).getPropertyValue(token.name).trim(),
    );
  }, [token.name, theme]);

  return (
    <article
      ref={rootRef}
      data-theme={theme}
      className="overflow-hidden rounded-xl border border-(--border) bg-(--surface) shadow-sm"
    >
      <TokenPreview kind={kind} styleValue={`var(${token.name})`} />
      <div className="space-y-2 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-(--foreground)">
              {token.role}
            </p>
            <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-[11px] font-semibold uppercase text-(--muted)">
              {theme}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-(--muted)">
            {token.name}
          </p>
        </div>
        <p className="text-xs leading-5 text-(--muted)">
          {token.description}
        </p>
        <p className="break-words rounded-lg bg-(--surface-muted) px-2 py-1.5 font-mono text-[11px] leading-4 text-(--foreground)">
          {resolvedValue || `var(${token.name})`}
        </p>
      </div>
    </article>
  );
}

function PrimitiveGroupSection({ group }: { group: TokenGroup<PrimitiveToken> }) {
  return (
    <section className="space-y-4">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-(--foreground)">
          {group.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--muted)">
          {group.description}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {group.tokens.map((token) => (
          <PrimitiveSwatch key={`${group.title}-${token.name}`} token={token} />
        ))}
      </div>
    </section>
  );
}

function ThemeTokenGroupSection({ group }: { group: TokenGroup<ThemeToken> }) {
  return (
    <section className="space-y-4">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-(--foreground)">
          {group.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--muted)">
          {group.description}
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {group.tokens.map((token) => (
          <div
            key={token.name}
            className="grid gap-4 rounded-2xl border border-(--border) bg-(--surface-muted) p-4 md:grid-cols-2"
          >
            <ThemeTokenSwatch token={token} theme="light" />
            <ThemeTokenSwatch token={token} theme="dark" />
          </div>
        ))}
      </div>
    </section>
  );
}

export const Palette: Story = {
  render: () => (
    <div className="min-h-screen bg-(--background) px-6 py-8 text-(--foreground)">
      <div className="mx-auto max-w-7xl space-y-14">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-(--muted)">
            EasyClip Design Tokens
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-(--foreground)">
            Color Tokens
          </h1>
          <p className="mt-3 text-sm leading-6 text-(--muted)">
            먼저 실제 색상 값인 primitive를 확인하고, 아래 Theme Tokens에서
            semantic token이 light/dark theme에 따라 어떤 primitive/effect 값으로
            매핑되는지 비교합니다.
          </p>
        </header>

        <section className="space-y-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-(--muted)">
              Step 1
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-(--foreground)">
              Primitive Palette
            </h2>
            <p className="mt-2 text-sm leading-6 text-(--muted)">
              primitive는 특정 UI 역할을 갖기 전의 원재료 색상입니다. 실제
              제품 코드에서는 semantic token을 우선 사용하고, primitive는 토큰
              설계와 점검 기준으로 사용합니다.
            </p>
          </div>
          {primitiveGroups.map((group) => (
            <PrimitiveGroupSection key={group.title} group={group} />
          ))}
        </section>

        <section className="space-y-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-(--muted)">
              Step 2
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-(--foreground)">
              Theme Tokens
            </h2>
            <p className="mt-2 text-sm leading-6 text-(--muted)">
              theme token은 컴포넌트가 실제로 참조하는 의미 기반 변수입니다.
              각 토큰은 light와 dark 값을 함께 보여주며, Storybook toolbar의
              Theme 설정과 무관하게 두 테마를 동시에 비교할 수 있습니다.
            </p>
          </div>
          {themeTokenGroups.map((group) => (
            <ThemeTokenGroupSection key={group.title} group={group} />
          ))}
        </section>
      </div>
    </div>
  ),
};
