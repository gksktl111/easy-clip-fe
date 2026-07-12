import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "@/shared/ui/badge/Badge";

const meta = {
  title: "Shared UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Badge",
    variant: "muted",
    size: "xs",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["chip", "muted", "mutedStrong", "elevated", "featured"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["chip", "muted", "mutedStrong", "elevated", "featured"] as const).map(
        (variant) => (
          <Badge
            key={variant}
            variant={variant}
            style={
              variant === "featured"
                ? { backgroundColor: "var(--pricing-featured-badge)" }
                : undefined
            }
          >
            {variant}
          </Badge>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["xs", "sm", "md"] as const).map((size) => (
        <Badge key={size} size={size} variant="mutedStrong">
          {size}
        </Badge>
      ))}
    </div>
  ),
};
