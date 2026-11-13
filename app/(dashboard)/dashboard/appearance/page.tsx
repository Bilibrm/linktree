import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { AppearanceClient } from "@/components/dashboard/appearance-client"
import { pageThemeToConfig, serializeBlockLean } from "@/lib/serialize-block"

export default async function AppearancePage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  const blocks = await Block.find({ pageId: page._id, isActive: true }).sort({ order: 1 }).lean()

  const serializedBlocks = blocks.map((b) => serializeBlockLean(b))

  return (
    <AppearanceClient
      pageId={page._id.toString()}
      initialTheme={pageThemeToConfig(page.theme)}
      username={session.user.username || ""}
      blocks={serializedBlocks}
      displayName={page.title || session.user.username || ""}
      avatarUrl={undefined}
      bio={page.bio}
      title={page.title}
      initialVisibility={page.visibility || "public"}
    />
  )
}
