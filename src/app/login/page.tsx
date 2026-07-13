import { Suspense } from "react";
import { LoginPageController } from "@/app/login/_components/LoginPageController";

export default function Login() {
  return (
    <Suspense>
      <LoginPageController />
    </Suspense>
  );
}
