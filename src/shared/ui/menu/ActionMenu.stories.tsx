import type { Meta, StoryObj } from "@storybook/nextjs";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { ActionMenu } from "@/shared/ui/menu/ActionMenu";

const meta = {
  title: "Shared UI/ActionMenu",
  component: ActionMenu,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "relative",
    items: [
      {
        label: "이름 변경",
        icon: <HiOutlinePencil className="h-4 w-4" aria-hidden />,
        onClick: () => undefined,
      },
      {
        label: "삭제",
        icon: <HiOutlineTrash className="h-4 w-4" aria-hidden />,
        tone: "danger",
        onClick: () => undefined,
      },
    ],
  },
};

export const MutedItem: Story = {
  args: {
    className: "relative",
    items: [
      {
        label: "기본 작업",
        onClick: () => undefined,
      },
      {
        label: "보조 작업",
        tone: "muted",
        onClick: () => undefined,
      },
    ],
  },
};
