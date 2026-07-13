import { AuthGuard } from "@/app/_components/AuthGuard";

// 결제 시작과 결제 결과 callback 경로에 동일한 인증 정책을 적용합니다.
export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
