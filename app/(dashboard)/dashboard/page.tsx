import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"
import { Block } from "@/lib/models/block"
import { User } from "@/lib/models/user"
import { EditorClient } from "@/components/dashboard/editor/editor-client"
import { pageThemeToConfig, serializeBlockLean } from "@/lib/serialize-block"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()
  if (!page) redirect("/auth/signup")

  const [blocks, user] = await Promise.all([
    Block.find({ pageId: page._id }).sort({ order: 1 }).lean(),
    User.findById(session.user.id).select("name avatarUrl").lean(),
  ])

  return (
    <EditorClient
      pageId={page._id.toString()}
      username={session.user.username || ""}
      initialBlocks={blocks.map((b) => serializeBlockLean(b))}
      theme={pageThemeToConfig(page.theme)}
      // Same sources as the public page: the name and photo live on the user, the tagline and bio on the page.
      initialBasics={{
        displayName: user?.name || "",
        avatarUrl: user?.avatarUrl || "",
        title: page.title || "",
        bio: page.bio || "",
      }}
    />
  )
}
