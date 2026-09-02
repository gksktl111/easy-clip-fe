import {
  HiOutlineFolder,
  HiOutlineLightningBolt,
  HiOutlineSearch,
  HiOutlineStar,
} from "react-icons/hi";

export const LANDING_FEATURES = [
  {
    key: "capture",
    icon: HiOutlineLightningBolt,
  },
  {
    key: "folder",
    icon: HiOutlineFolder,
  },
  {
    key: "favorite",
    icon: HiOutlineStar,
  },
  {
    key: "search",
    icon: HiOutlineSearch,
  },
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
      "링크나 텍스트를 메신저로 다시 보내지 않아도 돼서 작업 흐름이 끊기지 않아요.",
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
      "링크나 텍스트를 메신저로 다시 보내지 않아도 돼서 작업 흐름이 끊기지 않아요.",
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
      "링크나 텍스트를 메신저로 다시 보내지 않아도 돼서 작업 흐름이 끊기지 않아요.",
    name: "김민수",
    role: "Senior Product Designer, MetaFlow",
    avatar: "김",
  },
] as const;

export const LANDING_WORKFLOW_STEPS = [
  {
    step: "capture",
  },
  {
    step: "organize",
  },
  {
    step: "reuse",
  },
] as const;
