import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/ko.json";
import { ClipItem } from "@/features/clip/ui/ClipItem";

const meta = {
  title: "Features/Clip/ClipItem",
  component: ClipItem,
  decorators: [
    (Story) => (
      <NextIntlClientProvider
        locale="ko"
        messages={messages}
        timeZone="Asia/Seoul"
      >
        <div className="w-72">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
  args: {
    clip: {
      id: "clip-1",
      folderId: "folder-1",
      type: "text",
      name: "디자인 검토 메모",
      content:
        "아이콘은 내용을 보조하고, 버튼은 충분한 클릭 영역과 명확한 선택 상태를 제공합니다.",
      createdAt: new Date("2026-09-08"),
      updatedAt: new Date("2026-09-08"),
      isFavorite: false,
      tags: [],
    },
    onToggleFavorite: () => {},
    onEditTags: () => {},
    onContextMenu: () => {},
  },
} satisfies Meta<typeof ClipItem>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Favorite: Story = {
  args: { clip: { ...meta.args.clip, isFavorite: true } },
};
export const PendingFavorite: Story = {
  args: {
    ...Favorite.args,
    isFavoriteMutationPending: true,
    pendingFavoriteClipId: "clip-1",
  },
};
export const Disabled: Story = { args: { isInteractionDisabled: true } };
export const Selected: Story = {
  args: { isDeleteMode: true, isSelected: true },
};
export const Color: Story = {
  args: {
    clip: {
      ...meta.args.clip,
      type: "color",
      name: "브랜드 컬러",
      content: "#3b82f6",
    },
  },
};

export const Copying: Story = {
  args: { pendingCopyClipId: "clip-1" },
};
export const WaitingForOtherCopy: Story = {
  args: { pendingCopyClipId: "clip-2" },
};
