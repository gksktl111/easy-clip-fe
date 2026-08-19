import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

const SENTRY_FLUSH_TIMEOUT = 2_000;

export function GET() {
  return new NextResponse(null, { status: 404 });
}

export async function POST() {
  if (process.env.VERCEL_ENV !== "preview") {
    return new NextResponse(null, { status: 404 });
  }

  Sentry.captureException(new Error("SENTRY_PREVIEW_SERVER_PROBE"));
  const sent = await Sentry.flush(SENTRY_FLUSH_TIMEOUT);

  return NextResponse.json(
    { sent },
    {
      // 의도적인 500 응답으로 브라우저 요청과 서버 오류 이벤트를 함께 검증합니다.
      status: sent ? 500 : 503,
    },
  );
}
