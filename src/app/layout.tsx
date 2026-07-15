import type { Metadata } from "next";
import { UserSettingsSync } from "@/app/_components/UserSettingsSync";
import { SessionProvider } from "@/app/providers/session/SessionProvider";
import { hasAuthSessionCookie } from "@/features/auth/server";
import { getInitialUserSettings } from "@/features/settings/server";
import { AppToaster } from "@/shared/feedback/AppToaster";
import { AppSettingsProvider } from "@/shared/providers/AppSettingsProvider";
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
  const shouldRestoreSession = await hasAuthSessionCookie();
  const initialSettings = await getInitialUserSettings({
    shouldFetchServerSettings: shouldRestoreSession,
  });

  return (
    <html
      lang={initialSettings.language}
      data-theme={initialSettings.theme}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <QueryProvider>
          {/* 서버 설정 또는 settings cookie 초기값을 런타임 설정 store와 next-intl provider에 연결합니다. */}
          <AppSettingsProvider
            initialLocale={initialSettings.language}
            initialTheme={initialSettings.theme}
          >
            <SessionProvider shouldRestoreSession={shouldRestoreSession}>
              <UserSettingsSync
                enabled={initialSettings.source === "fallback"}
              />
              {children}
              <AppToaster />
            </SessionProvider>
          </AppSettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
