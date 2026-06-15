import { Suspense } from "react";
import { LoginPage } from "@/features/auth/ui/LoginPage";

export default function Login() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
