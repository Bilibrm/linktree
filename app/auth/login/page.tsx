import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Log in — LinkNest",
  description: "Log in to edit your LinkNest page.",
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-[400px]">
      <LoginForm />
    </div>
  )
}
