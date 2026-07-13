import type { Meta, StoryObj } from "@storybook/nextjs";
import { ConfirmActionModal } from "@/shared/ui/overlay/ConfirmActionModal";

const meta = {
  title: "Shared UI/ConfirmActionModal",
  component: ConfirmActionModal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isOpen: true,
    title: "항목을 삭제할까요?",
    description: "삭제한 항목은 복구할 수 없습니다.",
    cancelLabel: "취소",
    confirmLabel: "삭제",
    onCancel: () => undefined,
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ConfirmActionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Confirming: Story = {
  args: {
    confirmLabel: "삭제 중",
    isConfirming: true,
  },
};
