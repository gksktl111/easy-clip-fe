import * as Sentry from "@sentry/nextjs";
import { isSentryEnabled } from "./src/shared/config/sentry";

export async function register() {
  if (!isSentryEnabled(process.env.VERCEL_ENV)) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
