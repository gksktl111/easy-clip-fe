"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { HiOutlineHome, HiOutlineCollection } from "react-icons/hi";

export function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--background) px-6 py-12">
      <section
        className="w-full max-w-md rounded-3xl border border-(--border) bg-(--surface) px-8 py-10 text-center"
        aria-labelledby="not-found-title"
      >
        <p
          className="text-6xl font-semibold tracking-tight text-(--muted)"
          aria-hidden
        >
          404
        </p>
        <h1
          id="not-found-title"
          className="mt-6 text-2xl font-semibold text-balance [overflow-wrap:anywhere] break-keep text-(--foreground)"
        >
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-pretty [overflow-wrap:anywhere] break-keep text-(--muted)">
          {t("description")}
        </p>
        <nav
          aria-label={t("navigation")}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/"
            style={{ color: "var(--primary-foreground)" }}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-(--primary-foreground) hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
          >
            <HiOutlineHome className="h-5 w-5" aria-hidden />
            {t("home")}
          </Link>
          <Link
            href="/favorites"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-(--border) px-4 py-3 text-sm font-medium text-(--foreground) hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
          >
            <HiOutlineCollection className="h-5 w-5" aria-hidden />
            {t("clips")}
          </Link>
        </nav>
      </section>
    </main>
  );
}
