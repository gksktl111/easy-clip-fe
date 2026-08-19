import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const sentryEnvironment = process.env.VERCEL_ENV;
const isSentryDeployment =
  sentryEnvironment === "preview" || sentryEnvironment === "production";

const requiredSentryBuildEnvironmentVariables = [
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "VERCEL_GIT_COMMIT_SHA",
] as const;

const getMissingSentryBuildEnvironmentVariables = () =>
  requiredSentryBuildEnvironmentVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

if (isSentryDeployment) {
  const missingEnvironmentVariables = getMissingSentryBuildEnvironmentVariables();

  if (missingEnvironmentVariables.length > 0) {
    throw new Error(
      `Sentry ${sentryEnvironment} 배포에 필요한 환경변수가 없습니다: ${missingEnvironmentVariables.join(
        ", ",
      )}`,
    );
  }
}

const nextConfig: NextConfig = {
  env: {
    // 비밀 값 없이 Vercel의 배포 구분과 커밋 SHA만 클라이언트 런타임에 제공합니다.
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: sentryEnvironment ?? "",
    NEXT_PUBLIC_SENTRY_RELEASE: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.easy-clip.app",
      },
    ],
  },
};

const nextConfigWithIntl = withNextIntl(nextConfig);

export default isSentryDeployment
  ? withSentryConfig(nextConfigWithIntl, {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: {
        name: process.env.VERCEL_GIT_COMMIT_SHA,
      },
      silent: !process.env.CI,
      telemetry: false,
      webpack: {
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfigWithIntl;
