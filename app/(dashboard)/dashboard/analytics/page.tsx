import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { AnalyticsClient } from "@/components/dashboard/analytics-client"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  return <AnalyticsClient pageId={page._id.toString()} username={session.user.username || ""} />
}
