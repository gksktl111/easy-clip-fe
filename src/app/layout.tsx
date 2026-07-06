import type { Metadata } from "next";
import { getInitialUserSettings } from "@/features/settings/server/getInitialUserSettings";
import { IntlProvider } from "@/shared/ui/IntlProvider";
import { AppToaster } from "@/shared/ui/AppToaster";
import { QueryProvider } from "@/shared/ui/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyClip",
  description:
    "EasyClip is a clipboard manager that allows you to sync your clipboard across all your devices.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getInitialUserSettings();

  return (
    <html
      lang={initialSettings.language}
      data-theme={initialSettings.theme}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <QueryProvider>
          <IntlProvider
            initialLocale={initialSettings.language}
            initialTheme={initialSettings.theme}
            preferServerSettings={initialSettings.source === "server"}
          >
            {children}
            <AppToaster />
          </IntlProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
