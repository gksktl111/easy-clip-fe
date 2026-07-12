import type { Meta, StoryObj } from "@storybook/nextjs";
import { HiOutlinePlus, HiOutlineRefresh } from "react-icons/hi";
import { Button } from "@/shared/ui/button/Button";

const meta = {
  title: "Shared UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "버튼",
    variant: "secondary",
    size: "md",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "secondarySurface",
        "secondaryMuted",
        "pricing",
        "pricingFeatured",
        "chip",
        "surfaceGhost",
        "danger",
        "dangerSoft",
        "dangerOutline",
        "ghost",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {[
        "primary",
        "secondary",
        "secondarySurface",
        "secondaryMuted",
        "danger",
        "dangerSoft",
        "dangerOutline",
        "ghost",
      ].map((variant) => (
        <Button key={variant} variant={variant as never}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Button key={size} size={size} variant="primary">
          {size}
        </Button>
      ))}
      <Button size="icon" variant="secondary" aria-label="새로고침">
        <HiOutlineRefresh className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <HiOutlinePlus className="h-4 w-4" aria-hidden />
        추가하기
      </>
    ),
    variant: "primary",
  },
};

export const Disabled: Story = {
  args: {
    children: "비활성 버튼",
    disabled: true,
    variant: "primary",
  },
};
