"use client";

import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/shared/ui/button/Button";

const SENTRY_FLUSH_TIMEOUT = 2_000;

type ProbeState = "idle" | "sending" | "sent" | "failed";

export function SentryPreviewVerification() {
  const t = useTranslations("sentryExample");
  const [clientProbeState, setClientProbeState] =
    useState<ProbeState>("idle");
  const [serverProbeState, setServerProbeState] =
    useState<ProbeState>("idle");

  const getProbeStatus = (state: ProbeState) => {
    if (state === "sending") {
      return t("sending");
    }

    if (state === "sent") {
      return t("sent");
    }

    if (state === "failed") {
      return t("failed");
    }

    return null;
  };

  const sendClientProbe = async () => {
    setClientProbeState("sending");

    try {
      Sentry.captureException(new Error("SENTRY_PREVIEW_CLIENT_PROBE"));
      const sent = await Sentry.flush(SENTRY_FLUSH_TIMEOUT);

      setClientProbeState(sent ? "sent" : "failed");
    } catch {
      setClientProbeState("failed");
    }
  };

  const sendServerProbe = async () => {
    setServerProbeState("sending");

    try {
      const response = await fetch("/api/sentry-example-api", {
        method: "POST",
        cache: "no-store",
      });

      setServerProbeState(response.status === 500 ? "sent" : "failed");
    } catch {
      setServerProbeState("failed");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
      <section
        aria-labelledby="sentry-example-title"
        className="w-full rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm"
      >
        <p className="text-sm font-medium text-(--primary)">{t("eyebrow")}</p>
        <h1 id="sentry-example-title" className="mt-2 text-2xl font-semibold">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-(--muted)">
          {t("description")}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-(--border) p-4">
            <h2 className="font-medium">{t("clientTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-(--muted)">
              {t("clientDescription")}
            </p>
            <Button
              className="mt-4"
              variant="dangerOutline"
              disabled={clientProbeState === "sending"}
              onClick={sendClientProbe}
            >
              {clientProbeState === "sending"
                ? t("sending")
                : t("clientButton")}
            </Button>
            {clientProbeState !== "idle" ? (
              <p className="mt-3 text-sm text-(--muted)" role="status">
                {getProbeStatus(clientProbeState)}
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-(--border) p-4">
            <h2 className="font-medium">{t("serverTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-(--muted)">
              {t("serverDescription")}
            </p>
            <Button
              className="mt-4"
              variant="dangerOutline"
              disabled={serverProbeState === "sending"}
              onClick={sendServerProbe}
            >
              {serverProbeState === "sending"
                ? t("sending")
                : t("serverButton")}
            </Button>
            {serverProbeState !== "idle" ? (
              <p className="mt-3 text-sm text-(--muted)" role="status">
                {getProbeStatus(serverProbeState)}
              </p>
            ) : null}
          </section>
        </div>

        <p className="mt-6 text-sm leading-6 text-(--muted)">{t("notice")}</p>
      </section>
    </main>
  );
}
