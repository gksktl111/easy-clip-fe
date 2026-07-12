"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Switch } from "@/shared/ui/input/Switch";

const meta = {
  title: "Shared UI/Input/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  args: {
    checked: true,
    "aria-label": "스위치",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchPreview({ disabled = false }: { disabled?: boolean }) {
  const [checked, setChecked] = useState(true);

  return (
    <Switch
      checked={checked}
      disabled={disabled}
      onClick={() => setChecked((previous) => !previous)}
      aria-label="스위치"
    />
  );
}

export const Checked: Story = {
  args: {
    checked: true,
    "aria-label": "켜짐 상태",
  },
};

export const Unchecked: Story = {
  args: {
    checked: false,
    "aria-label": "꺼짐 상태",
  },
};

export const Interactive: Story = {
  render: () => <SwitchPreview />,
};

export const Disabled: Story = {
  render: () => <SwitchPreview disabled />,
};
