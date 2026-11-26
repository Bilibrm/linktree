import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { User } from "@/lib/models/user"
import { LookClient } from "@/components/dashboard/look/look-client"
import { serializeBlockLean } from "@/lib/serialize-block"
import { draftFromStored } from "@/lib/themes"

export default async function AppearancePage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  const [blocks, user] = await Promise.all([
    Block.find({ pageId: page._id, isActive: true }).sort({ order: 1 }).lean(),
    User.findById(session.user.id).select("name avatarUrl").lean(),
  ])

  // The stored theme in whatever shape it has, turned into the recipe the panel edits.
  const draft = draftFromStored(JSON.parse(JSON.stringify(page.theme ?? {})))

  return (
    <LookClient
      initialDraft={draft}
      username={session.user.username || ""}
      blocks={blocks.map((b) => serializeBlockLean(b))}
      // Same sources as the public page: name and photo on the user, tagline and bio on the page.
      header={{ displayName: user?.name || "", avatarUrl: user?.avatarUrl || undefined, title: page.title || "", bio: page.bio || "" }}
    />
  )
}
