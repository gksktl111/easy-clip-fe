"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Select } from "@/shared/ui/input/Select";

const options = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
] as const;

const meta = {
  title: "Shared UI/Input/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "ko",
    onChange: () => undefined,
    options,
    className: "w-48",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectPreview({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState("ko");

  return (
    <Select
      value={value}
      onChange={setValue}
      options={options}
      disabled={disabled}
      className="w-48"
    />
  );
}

export const Default: Story = {
  render: () => <SelectPreview />,
};

export const Disabled: Story = {
  render: () => <SelectPreview disabled />,
};
