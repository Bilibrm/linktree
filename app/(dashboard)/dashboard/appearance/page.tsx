import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { AppearanceClient } from "@/components/dashboard/appearance-client"

export default async function AppearancePage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  return (
    <AppearanceClient
      pageId={page._id.toString()}
      initialTheme={page.theme as any}
      username={session.user.username || ""}
    />
  )
}
