import type { Metadata } from "next";
import { getInitialLocale } from "@/shared/server/getUserLocale";
import { IntlProvider } from "@/shared/ui/IntlProvider";
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
  const locale = await getInitialLocale();

  return (
    <html lang={locale}>
      <body className="bg-slate-50 antialiased">
        <IntlProvider initialLocale={locale}>
          {children}
        </IntlProvider>
      </body>
    </html>
  );
}
