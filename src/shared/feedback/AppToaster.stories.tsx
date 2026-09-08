import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import ko from "@/messages/ko.json";
import en from "@/messages/en.json";
import ja from "@/messages/ja.json";
import zh from "@/messages/zh.json";
import { AppToaster } from "./AppToaster";
import { notifyError, notifySuccess } from "./toast";
import { Button } from "@/shared/ui/button/Button";

const messages = { ko, en, ja, zh };
function Examples() {
  const t = useTranslations("feedback");
  return (
    <div className="flex flex-wrap gap-3">
      <AppToaster />
      <Button
        onClick={() => notifySuccess(t("copySuccess"), undefined, "clip-copy")}
      >
        복사 성공 · 연속 클릭
      </Button>
      <Button
        onClick={() => notifyError(t("copyError"), undefined, "clip-copy")}
      >
        복사 실패
      </Button>
      <Button
        onClick={() =>
          notifySuccess(t("permanentDeleteSuccess", { count: 12 }))
        }
      >
        개수 포함 결과
      </Button>
      <Button
        onClick={() => notifyError(t("billingFailed"), t("billingStartError"))}
      >
        긴 오류 설명
      </Button>
    </div>
  );
}
const meta = {
  title: "Shared UI/Feedback/AppToaster",
  component: AppToaster,
  argTypes: { locale: { control: "select", options: Object.keys(messages) } },
  args: { locale: "ko" },
  render: ({ locale }) => (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      <Examples />
    </NextIntlClientProvider>
  ),
} satisfies Meta<{ locale: keyof typeof messages }>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const English: Story = { args: { locale: "en" } };
export const Japanese: Story = { args: { locale: "ja" } };
export const Chinese: Story = { args: { locale: "zh" } };
