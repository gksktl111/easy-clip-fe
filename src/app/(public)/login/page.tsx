import { Suspense } from "react";
import { LoginPageController } from "@/app/(public)/login/_components/LoginPageController";

export default function Login() {
  return (
    <Suspense>
      <LoginPageController />
    </Suspense>
  );
}
