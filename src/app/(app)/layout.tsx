import { AppShell } from "@/app/(app)/_components/AppShell";
import { AuthGuard } from "@/app/_components/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
