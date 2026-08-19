import * as Sentry from "@sentry/nextjs";
import { createSentryOptions } from "./src/shared/config/sentry";

const sentryOptions = createSentryOptions({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  deploymentEnvironment: process.env.VERCEL_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});

if (sentryOptions.enabled) {
  Sentry.init(sentryOptions);
}
