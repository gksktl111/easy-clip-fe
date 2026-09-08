import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { NameInputModal } from "@/shared/ui/overlay/NameInputModal";

const meta = {
  title: "Shared UI/NameInputModal",
  component: NameInputModal,
  args: {
    title: "클립 이름 변경",
    closeLabel: "이름 변경 닫기",
    fieldLabel: "클립 이름",
    placeholder: "새 이름을 입력하세요",
    confirmLabel: "변경",
    cancelLabel: "취소",
    value: "디자인 검토 메모",
    onChange: () => {},
    onClose: () => {},
    onConfirm: () => {},
  },
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    return <NameInputModal {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof NameInputModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const RenameClip: Story = {};
export const RenameFolder: Story = {
  args: { title: "폴더 이름 변경", fieldLabel: "폴더 이름" },
};
export const Submitting: Story = { args: { isSubmitting: true } };

export const NameTooLong: Story = {
  args: {
    value: "1234567890123456",
    helperText: "앞뒤 공백 제외, 최대 15자까지 입력할 수 있습니다.",
    errorMessage: "이름은 앞뒤 공백을 제외하고 15자 이내로 입력해주세요.",
    characterCount: "16/15자",
  },
};
