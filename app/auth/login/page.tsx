import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign In — LinkNest",
  description: "Sign in to your LinkNest page to manage your blocks, analytics, and appearance.",
}

export default function LoginPage() {
  return <LoginForm />
}
