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
