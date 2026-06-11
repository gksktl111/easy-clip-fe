export interface PricingPlan {
  name: string;
  badge: string;
  description: string;
  price: string;
  priceSuffix?: string;
  billingNote: string;
  ctaLabel: string;
  highlight: boolean;
  features: readonly string[];
}

export interface PricingComparisonPoint {
  label: string;
  freeValue: string;
  proValue: string;
}

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    name: "Free",
    badge: "개인 시작용",
    description: "가볍게 시작하고 검색 중심으로 클립을 정리하는 기본 플랜",
    price: "₩0",
    priceSuffix: "/ month",
    billingNote: "월간 요금 없이 바로 사용",
    ctaLabel: "무료로 시작하기",
    highlight: false,
    features: [
      "하나의 프로젝트 사용 가능",
      "최대 50개의 클립 생성 가능",
      "데스크톱 1개, 모바일 1개 연동 가능",
      "검색 기능 사용 가능",
    ],
  },
  {
    name: "Pro",
    badge: "집중 작업용",
    description: "프로젝트를 여러 개 운영하고 태그 기반 정리가 필요한 플랜",
    price: "출시 예정",
    billingNote: "상세 요금과 결제 방식은 추후 공개",
    ctaLabel: "Pro 플랜 보기",
    highlight: true,
    features: [
      "무제한 프로젝트 생성 가능",
      "각 프로젝트당 최대 500개의 클립 생성 가능",
      "무제한 기기 연동",
      "태그 기능 사용 가능",
      "AI 기능 추가 예정",
    ],
  },
] as const;

export const PRICING_COMPARISON_POINTS: readonly PricingComparisonPoint[] = [
  {
    label: "프로젝트 수",
    freeValue: "1개",
    proValue: "무제한",
  },
  {
    label: "클립 수",
    freeValue: "최대 50개",
    proValue: "프로젝트당 최대 500개",
  },
  {
    label: "기기 연동",
    freeValue: "데스크톱 1개 + 모바일 1개",
    proValue: "무제한 기기 연동",
  },
  {
    label: "정리 방식",
    freeValue: "검색",
    proValue: "검색 + 태그",
  },
  {
    label: "AI 기능",
    freeValue: "미지원",
    proValue: "추가 예정",
  },
] as const;
