import type { Meta, StoryObj } from "@storybook/nextjs";
import { Text } from "@/shared/ui/typography/Text";

const meta = {
  title: "Shared UI/Text",
  component: Text,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "텍스트",
    variant: "body",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "pageTitle",
        "sectionLabel",
        "itemTitle",
        "body",
        "bodyMuted",
        "bodyStrong",
        "caption",
        "captionStrong",
      ],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="space-y-3">
      {[
        "pageTitle",
        "sectionLabel",
        "itemTitle",
        "body",
        "bodyMuted",
        "bodyStrong",
        "caption",
        "captionStrong",
      ].map((variant) => (
        <Text key={variant} variant={variant as never}>
          {variant}
        </Text>
      ))}
    </div>
  ),
};
