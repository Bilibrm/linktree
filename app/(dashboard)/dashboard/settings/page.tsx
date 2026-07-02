import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { Page } from "@/lib/models/page"
import { SettingsClient } from "@/components/dashboard/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const [user, page] = await Promise.all([
    User.findById(session.user.id).select("-passwordHash").lean(),
    Page.findOne({ userId: session.user.id }).lean(),
  ])

  if (!user || !page) redirect("/auth/signup")

  return (
    <SettingsClient
      user={{
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      }}
      page={{
        _id: page._id.toString(),
        title: page.title,
        bio: page.bio,
        seo: page.seo,
        isPublished: page.isPublished,
      }}
    />
  )
}
