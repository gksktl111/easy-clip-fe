import type { Meta, StoryObj } from "@storybook/nextjs";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { EmptyStateCard } from "@/shared/ui/empty-state/EmptyStateCard";

const meta = {
  title: "Shared UI/EmptyStateCard",
  component: EmptyStateCard,
  parameters: {
    layout: "centered",
  },
  args: {
    icon: <HiOutlineClipboardCopy className="h-7 w-7" aria-hidden />,
    title: "표시할 항목이 없습니다",
    description: "조건에 맞는 데이터가 생기면 이 영역에 표시됩니다.",
  },
} satisfies Meta<typeof EmptyStateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    title: "아직 저장된 클립이 없습니다",
    description:
      "복사한 텍스트, 이미지, 색상 값을 저장하면 여기에서 다시 확인하고 사용할 수 있습니다.",
  },
};
