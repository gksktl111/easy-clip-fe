import * as Sentry from "@sentry/nextjs";
import { createSentryOptions } from "./src/shared/config/sentry";

const sentryOptions = createSentryOptions({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  deploymentEnvironment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});

if (sentryOptions.enabled) {
  Sentry.init(sentryOptions);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
