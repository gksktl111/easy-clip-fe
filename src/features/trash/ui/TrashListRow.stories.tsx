import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/ko.json";
import { TrashListRow } from "@/features/trash/ui/TrashListRow";

const meta = {
  title: "Features/Trash/TrashListRow",
  component: TrashListRow,
  decorators: [
    (Story) => (
      <NextIntlClientProvider
        locale="ko"
        messages={messages}
        timeZone="Asia/Seoul"
      >
        <div className="bg-(--surface)">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
  args: {
    row: {
      kind: "clip",
      id: "clip-1",
      name: "프로젝트 회의에서 정리한 디자인 검토 자료",
      clipType: "TEXT",
      parentFolderName: "프로젝트",
      deletedAt: "2026-09-08T00:00:00Z",
      typeLabel: "파일 · 텍스트",
    },
    isSelected: false,
    pendingActionKey: null,
    onToggleSelected: () => {},
    onRestoreClip: () => {},
    onDeleteClip: () => {},
    onRestoreFolder: () => {},
    onDeleteFolder: () => {},
  },
} satisfies Meta<typeof TrashListRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selected: Story = { args: { isSelected: true } };
export const Restoring: Story = {
  args: { pendingActionKey: "clip-restore-clip-1" },
};
export const Folder: Story = {
  args: {
    row: {
      kind: "folder",
      id: "folder-1",
      name: "지난 프로젝트",
      deletedAt: null,
      typeLabel: "폴더",
    },
  },
};
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};
