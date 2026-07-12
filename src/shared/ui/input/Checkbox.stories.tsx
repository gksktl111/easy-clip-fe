import type { Meta, StoryObj } from "@storybook/nextjs";
import { Checkbox } from "@/shared/ui/input/Checkbox";

const meta = {
  title: "Shared UI/Input/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  args: {
    "aria-label": "체크박스",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center gap-3 text-sm font-medium text-(--foreground)">
      <Checkbox defaultChecked />
      선택 항목
    </label>
  ),
};
