import type { Metadata } from "next";
import { UserSettingsSync } from "@/app/_components/UserSettingsSync";
import { SessionProvider } from "@/app/providers/session/SessionProvider";
import { hasAuthSessionCookie } from "@/features/auth/server";
import { getInitialUserSettings } from "@/features/settings/server";
import { AppToaster } from "@/shared/feedback/AppToaster";
import { IntlProvider } from "@/shared/providers/IntlProvider";
import { QueryProvider } from "@/shared/providers/QueryProvider";
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
  const [initialSettings, shouldRestoreSession] = await Promise.all([
    getInitialUserSettings(),
    hasAuthSessionCookie(),
  ]);

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
            <SessionProvider shouldRestoreSession={shouldRestoreSession}>
              <UserSettingsSync
                enabled={initialSettings.source === "fallback"}
              />
              {children}
              <AppToaster />
            </SessionProvider>
          </IntlProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
