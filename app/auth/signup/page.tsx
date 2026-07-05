import type { Metadata } from "next"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = {
  title: "Create Your Page — LinkNest",
  description: "Create your LinkNest page. One page to share everything you are. Free to start.",
}

export default function SignupPage() {
  return <SignupForm />
}
