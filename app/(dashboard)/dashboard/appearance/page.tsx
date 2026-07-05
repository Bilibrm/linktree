import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { AppearanceClient } from "@/components/dashboard/appearance-client"

export default async function AppearancePage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  const blocks = await Block.find({ pageId: page._id, isActive: true }).sort({ order: 1 }).lean()

  const serializedBlocks = blocks.map((b) => ({
    _id: b._id.toString(),
    pageId: b.pageId.toString(),
    type: b.type as any,
    order: b.order,
    data: b.data as any,
    startAt: b.startAt?.toISOString() ?? null,
    endAt: b.endAt?.toISOString() ?? null,
    isActive: b.isActive,
  }))

  return (
    <AppearanceClient
      pageId={page._id.toString()}
      initialTheme={page.theme as any}
      username={session.user.username || ""}
      blocks={serializedBlocks}
      displayName={page.title || session.user.username || ""}
      avatarUrl={(page as any).avatarUrl}
      bio={page.bio}
      title={page.title}
      initialVisibility={page.visibility || "public"}
    />
  )
}
