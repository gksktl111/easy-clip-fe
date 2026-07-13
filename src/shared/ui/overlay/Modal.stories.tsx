import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@/shared/ui/button/Button";
import { Modal } from "@/shared/ui/overlay/Modal";

const meta = {
  title: "Shared UI/Modal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isOpen: true,
    overlay: "default",
  },
  argTypes: {
    overlay: {
      control: "select",
      options: ["default", "strong"],
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    contentClassName: "w-full max-w-sm",
    children: (
      <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-(--foreground)">모달 제목</h2>
        <p className="mt-3 text-sm leading-6 text-(--muted)">
          공통 Modal 컴포넌트의 오버레이와 콘텐츠 영역을 확인합니다.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm">
            취소
          </Button>
          <Button variant="primary" size="sm">
            확인
          </Button>
        </div>
      </div>
    ),
  },
};

export const StrongOverlay: Story = {
  args: {
    ...Default.args,
    overlay: "strong",
  },
};
