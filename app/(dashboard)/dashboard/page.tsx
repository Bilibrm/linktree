import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { pageThemeToConfig, serializeBlockLean } from "@/lib/serialize-block"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  const blocks = await Block.find({ pageId: page._id }).sort({ order: 1 }).lean()

  const serializedBlocks = blocks.map((b) => serializeBlockLean(b))

  return (
    <DashboardClient
      pageId={page._id.toString()}
      username={session.user.username || ""}
      initialBlocks={serializedBlocks}
      theme={pageThemeToConfig(page.theme)}
      displayName={page.title || session.user.username || ""}
      avatarUrl={undefined}
      bio={page.bio}
      title={page.title}
    />
  )
}
