import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { ResourceAccessLoading } from "./ResourceAccessLoading";
import ko from "@/messages/ko.json";

const meta = {
  title: "Shared UI/Access/ResourceAccessLoading",
  component: ResourceAccessLoading,
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="ko" messages={ko}>
        <div className="h-96">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
  args: {
    children: (
      <div aria-hidden className="space-y-4 p-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="skeleton-shimmer h-16 rounded-lg" />
        ))}
      </div>
    ),
  },
} satisfies Meta<typeof ResourceAccessLoading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Checking: Story = {};
