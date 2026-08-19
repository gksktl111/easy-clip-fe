import { notFound } from "next/navigation";
import { SentryPreviewVerification } from "./_components/SentryPreviewVerification";

export default function SentryExamplePage() {
  if (process.env.VERCEL_ENV !== "preview") {
    notFound();
  }

  return <SentryPreviewVerification />;
}
