import {
  HiOutlineFolder,
  HiOutlineLightningBolt,
  HiOutlineSearch,
  HiOutlineStar,
} from "react-icons/hi";

export const LANDING_FEATURES = [
  {
    key: "sync",
    title: "즉시 동기화",
    description: "복사하는 순간 모든 기기에 실시간으로 반영됩니다.",
    icon: HiOutlineLightningBolt,
  },
  {
    key: "folder",
    title: "폴더 정리",
    description: "프로젝트별로 클립을 묶어 체계적으로 관리하세요.",
    icon: HiOutlineFolder,
  },
  {
    key: "favorite",
    title: "즐겨찾기",
    description: "자주 쓰는 문구는 즐겨찾기로 빠르게 접근하세요.",
    icon: HiOutlineStar,
  },
  {
    key: "search",
    title: "빠른 검색",
    description: "키워드를 입력하면 즉시 원하는 클립을 찾아냅니다.",
    icon: HiOutlineSearch,
  },
] as const;

export const LANDING_DEMO_ITEMS = [
  "디자인 가이드라인",
  "API 엔드포인트",
  "회의 노트",
] as const;

export const LANDING_MOBILE_DEMO_ITEMS = [
  "디자인 가이드",
  "API 엔드포인트",
] as const;

export const LANDING_REVIEWS = [
  {
    quote:
      "코드 스니펫이랑 API 키를 한 곳에 모아두니까 검색하느라 흐름이 끊기지 않아요.",
    name: "이지훈",
    role: "Frontend Developer, TechNova",
    avatar: "이",
  },
  {
    quote:
      "팀 전체가 클립 템플릿을 공유하면서 디자인 가이드라인과 문구 싱크가 훨씬 빨라졌습니다.",
    name: "박상훈",
    role: "Creative Director, Studio Orion",
    avatar: "P",
  },
  {
    quote:
      "링크나 텍스트를 메신저로 다시 보내지 않아도 돼서 모바일과 데스크탑 사이의 작업 공백이 사라졌어요.",
    name: "김민수",
    role: "Senior Product Designer, MetaFlow",
    avatar: "김",
  },
  {
    quote:
      "팀 전체가 클립 템플릿을 공유하면서 디자인 가이드라인과 문구 싱크가 훨씬 빨라졌습니다.",
    name: "박상훈",
    role: "Creative Director, Studio Orion",
    avatar: "P",
  },
  {
    quote:
      "링크나 텍스트를 메신저로 다시 보내지 않아도 돼서 모바일과 데스크탑 사이의 작업 공백이 사라졌어요.",
    name: "김민수",
    role: "Senior Product Designer, MetaFlow",
    avatar: "김",
  },
  {
    quote:
      "팀 전체가 클립 템플릿을 공유하면서 디자인 가이드라인과 문구 싱크가 훨씬 빨라졌습니다.",
    name: "박상훈",
    role: "Creative Director, Studio Orion",
    avatar: "P",
  },
  {
    quote:
      "링크나 텍스트를 메신저로 다시 보내지 않아도 돼서 모바일과 데스크탑 사이의 작업 공백이 사라졌어요.",
    name: "김민수",
    role: "Senior Product Designer, MetaFlow",
    avatar: "김",
  },
] as const;

export const LANDING_WORKFLOW_STEPS = [
  {
    step: "capture",
    title: "복사하면 바로 저장",
    description:
      "코드, 링크, 문구를 복사하는 즉시 EasyClip에 쌓입니다. 따로 메모앱을 열거나 나에게 보내둘 필요가 없습니다.",
  },
  {
    step: "organize",
    title: "프로젝트별로 분류",
    description:
      "클립을 폴더와 즐겨찾기로 정리해서 작업 맥락을 유지합니다. 찾는 시간이 줄고 팀 공통 문구 관리도 쉬워집니다.",
  },
  {
    step: "reuse",
    title: "어디서든 다시 붙여넣기",
    description:
      "모바일과 데스크탑을 오가면서 필요한 클립을 즉시 꺼내 재사용합니다. 반복 입력과 전송 과정이 자연스럽게 사라집니다.",
  },
] as const;
