import type { Metadata } from "next"
import { normalizeUsername } from "@/lib/site"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = {
  title: "Claim your name — LinkNest",
  description: "Claim your LinkNest name and start your page. Free and open source.",
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { username } = await searchParams
  const initial = typeof username === "string" ? normalizeUsername(username) : ""
  return <SignupForm initialUsername={initial} />
}
