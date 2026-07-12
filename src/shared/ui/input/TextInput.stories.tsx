import type { Meta, StoryObj } from "@storybook/nextjs";
import { HiOutlineSearch } from "react-icons/hi";
import { TextInput } from "@/shared/ui/input/TextInput";

const meta = {
  title: "Shared UI/Input/TextInput",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "텍스트를 입력하세요",
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: "EasyClip",
  },
};

export const WithLeftIcon: Story = {
  args: {
    className: "w-72",
    leftIcon: <HiOutlineSearch className="h-5 w-5" aria-hidden />,
    placeholder: "검색어를 입력하세요",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "수정할 수 없는 값",
    disabled: true,
  },
};
